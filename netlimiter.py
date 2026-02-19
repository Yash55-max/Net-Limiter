"""
NetLimiter - Bandwidth Control Application
A comprehensive network bandwidth monitoring and control tool with user authentication
"""

import psutil
import time
import json
import threading
from datetime import datetime
from collections import defaultdict
from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import socket
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
CORS(app)

# Initialize extensions
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'

# In-memory user storage (in production, use a database)
users_db = {
    'organizer': {
        'username': 'organizer',
        'password': bcrypt.generate_password_hash('organizer123').decode('utf-8'),
        'role': 'organizer',
        'email': 'organizer@netlimiter.com'
    },
    'admin': {
        'username': 'admin',
        'password': bcrypt.generate_password_hash('admin123').decode('utf-8'),
        'role': 'admin',
        'email': 'admin@netlimiter.com'
    }
}

class User(UserMixin):
    def __init__(self, username, role, email):
        self.id = username
        self.username = username
        self.role = role
        self.email = email
    
    def is_admin(self):
        return self.role in ['admin', 'organizer']
    
    def is_organizer(self):
        return self.role == 'organizer'

@login_manager.user_loader
def load_user(username):
    if username in users_db:
        user_data = users_db[username]
        return User(user_data['username'], user_data['role'], user_data['email'])
    return None

class BandwidthController:
    def __init__(self):
        self.process_stats = {}
        self.bandwidth_limits = {}  # {pid: {'upload': limit, 'download': limit}}
        self.connection_stats = defaultdict(lambda: {'sent': 0, 'recv': 0})
        self.history = defaultdict(list)
        self.monitoring = True
        self.lock = threading.Lock()
        
    def get_process_connections(self):
        """Get all network connections with their associated processes"""
        connections = []
        for proc in psutil.process_iter(['pid', 'name', 'username']):
            try:
                pid = proc.info['pid']
                name = proc.info['name']
                username = proc.info['username']
                
                # Get connections for this process
                proc_obj = psutil.Process(pid)
                conns = proc_obj.connections(kind='inet')
                
                for conn in conns:
                    connections.append({
                        'pid': pid,
                        'name': name,
                        'username': username,
                        'local_addr': f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A",
                        'remote_addr': f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                        'status': conn.status,
                        'type': 'TCP' if conn.type == socket.SOCK_STREAM else 'UDP'
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
                
        return connections
    
    def get_network_stats(self):
        """Get current network statistics"""
        net_io = psutil.net_io_counters(pernic=True)
        stats = {}
        
        for interface, counters in net_io.items():
            stats[interface] = {
                'bytes_sent': counters.bytes_sent,
                'bytes_recv': counters.bytes_recv,
                'packets_sent': counters.packets_sent,
                'packets_recv': counters.packets_recv,
                'errin': counters.errin,
                'errout': counters.errout,
                'dropin': counters.dropin,
                'dropout': counters.dropout
            }
        
        return stats
    
    def calculate_bandwidth(self, old_stats, new_stats, interval):
        """Calculate bandwidth usage between two measurements"""
        bandwidth = {}
        
        for interface in new_stats:
            if interface in old_stats:
                sent_diff = new_stats[interface]['bytes_sent'] - old_stats[interface]['bytes_sent']
                recv_diff = new_stats[interface]['bytes_recv'] - old_stats[interface]['bytes_recv']
                
                bandwidth[interface] = {
                    'upload_speed': sent_diff / interval,  # bytes per second
                    'download_speed': recv_diff / interval,
                    'total_sent': new_stats[interface]['bytes_sent'],
                    'total_recv': new_stats[interface]['bytes_recv']
                }
        
        return bandwidth
    
    def get_process_network_usage(self):
        """Get network usage per process"""
        process_usage = []
        
        for proc in psutil.process_iter(['pid', 'name', 'username']):
            try:
                pid = proc.info['pid']
                name = proc.info['name']
                username = proc.info['username']
                
                # Get process IO counters
                proc_obj = psutil.Process(pid)
                io_counters = proc_obj.io_counters()
                
                # Get number of connections
                num_connections = len(proc_obj.connections(kind='inet'))
                
                if num_connections > 0:
                    # Check if we have limits set for this process
                    limits = self.bandwidth_limits.get(pid, {'upload': None, 'download': None})
                    
                    process_usage.append({
                        'pid': pid,
                        'name': name,
                        'username': username,
                        'connections': num_connections,
                        'read_bytes': io_counters.read_bytes,
                        'write_bytes': io_counters.write_bytes,
                        'upload_limit': limits['upload'],
                        'download_limit': limits['download']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        return process_usage
    
    def set_bandwidth_limit(self, pid, upload_limit=None, download_limit=None):
        """Set bandwidth limits for a process (in KB/s)"""
        with self.lock:
            if pid not in self.bandwidth_limits:
                self.bandwidth_limits[pid] = {}
            
            if upload_limit is not None:
                self.bandwidth_limits[pid]['upload'] = upload_limit
            if download_limit is not None:
                self.bandwidth_limits[pid]['download'] = download_limit
        
        return True
    
    def remove_bandwidth_limit(self, pid):
        """Remove bandwidth limits for a process"""
        with self.lock:
            if pid in self.bandwidth_limits:
                del self.bandwidth_limits[pid]
        return True
    
    def get_system_network_info(self):
        """Get overall system network information"""
        net_io = psutil.net_io_counters()
        
        return {
            'total_bytes_sent': net_io.bytes_sent,
            'total_bytes_recv': net_io.bytes_recv,
            'total_packets_sent': net_io.packets_sent,
            'total_packets_recv': net_io.packets_recv,
            'total_errin': net_io.errin,
            'total_errout': net_io.errout,
            'total_dropin': net_io.dropin,
            'total_dropout': net_io.dropout
        }
    
    def get_current_speeds(self):
        """Get current upload and download speeds across all interfaces"""
        total_upload = 0
        total_download = 0
        
        with self.lock:
            # Aggregate speeds from all interfaces
            for interface, history_data in self.history.items():
                if history_data and len(history_data) > 0:
                    latest = history_data[-1]
                    total_upload += latest['upload_speed']
                    total_download += latest['download_speed']
        
        return {
            'upload_speed': total_upload,
            'download_speed': total_download
        }
    
    def monitor_bandwidth(self):
        """Continuous bandwidth monitoring"""
        old_stats = self.get_network_stats()
        
        while self.monitoring:
            time.sleep(1)  # Update every second
            
            new_stats = self.get_network_stats()
            bandwidth = self.calculate_bandwidth(old_stats, new_stats, 1)
            
            with self.lock:
                timestamp = datetime.now().isoformat()
                for interface, data in bandwidth.items():
                    self.history[interface].append({
                        'timestamp': timestamp,
                        'upload_speed': data['upload_speed'],
                        'download_speed': data['download_speed']
                    })
                    
                    # Keep only last 60 seconds of history
                    if len(self.history[interface]) > 60:
                        self.history[interface].pop(0)
            
            old_stats = new_stats

# Initialize controller
controller = BandwidthController()

# Start monitoring in background
monitor_thread = threading.Thread(target=controller.monitor_bandwidth, daemon=True)
monitor_thread.start()

# Authentication Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        username = data.get('username')
        password = data.get('password')
        
        if username in users_db:
            user_data = users_db[username]
            if bcrypt.check_password_hash(user_data['password'], password):
                user = User(user_data['username'], user_data['role'], user_data['email'])
                login_user(user, remember=True)
                
                if request.is_json:
                    return jsonify({'success': True, 'role': user.role})
                return redirect(url_for('index'))
        
        if request.is_json:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        
        if username in users_db:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Username already exists'}), 400
            flash('Username already exists', 'error')
            return render_template('register.html')
        
        # Create new user with 'user' role
        users_db[username] = {
            'username': username,
            'password': bcrypt.generate_password_hash(password).decode('utf-8'),
            'role': 'user',
            'email': email
        }
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Registration successful'})
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('index.html', user=current_user)

@app.route('/api/network/stats')
@login_required
def get_network_stats():
    """Get current network statistics"""
    stats = controller.get_system_network_info()
    return jsonify(stats)

@app.route('/api/network/interfaces')
def get_interfaces():
    """Get network interface statistics"""
    stats = controller.get_network_stats()
    return jsonify(stats)

@app.route('/api/network/bandwidth')
def get_bandwidth():
    """Get current bandwidth usage"""
    with controller.lock:
        history = dict(controller.history)
    return jsonify(history)

@app.route('/api/network/current-speed')
def get_current_speed():
    """Get current upload and download speeds"""
    speeds = controller.get_current_speeds()
    return jsonify(speeds)


@app.route('/api/processes')
def get_processes():
    """Get processes with network activity"""
    processes = controller.get_process_network_usage()
    return jsonify(processes)

@app.route('/api/connections')
def get_connections():
    """Get all network connections"""
    connections = controller.get_process_connections()
    return jsonify(connections)

@app.route('/api/limit/set', methods=['POST'])
@login_required
def set_limit():
    """Set bandwidth limit for a process (Admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.json
    pid = data.get('pid')
    upload_limit = data.get('upload_limit')
    download_limit = data.get('download_limit')
    
    if pid is None:
        return jsonify({'error': 'PID is required'}), 400
    
    success = controller.set_bandwidth_limit(pid, upload_limit, download_limit)
    return jsonify({'success': success})

@app.route('/api/limit/remove', methods=['POST'])
@login_required
def remove_limit():
    """Remove bandwidth limit for a process (Admin only)"""
    # Check if user is admin
    if not current_user.is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.json
    pid = data.get('pid')
    
    if pid is None:
        return jsonify({'error': 'PID is required'}), 400
    
    success = controller.remove_bandwidth_limit(pid)
    return jsonify({'success': success})


@app.route('/api/limits')
def get_limits():
    """Get all current bandwidth limits"""
    with controller.lock:
        limits = dict(controller.bandwidth_limits)
    return jsonify(limits)

# User Management Routes (Organizer Only)
@app.route('/api/users')
@login_required
def get_users():
    """Get all users (Organizer only)"""
    if not current_user.is_organizer():
        return jsonify({'error': 'Organizer access required'}), 403
    
    users_list = []
    for username, user_data in users_db.items():
        users_list.append({
            'username': username,
            'email': user_data['email'],
            'role': user_data['role']
        })
    
    return jsonify(users_list)

@app.route('/api/users/promote', methods=['POST'])
@login_required
def promote_user():
    """Promote a user to admin (Organizer only)"""
    if not current_user.is_organizer():
        return jsonify({'error': 'Organizer access required'}), 403
    
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    if username not in users_db:
        return jsonify({'error': 'User not found'}), 404
    
    if users_db[username]['role'] == 'organizer':
        return jsonify({'error': 'Cannot modify organizer account'}), 400
    
    if users_db[username]['role'] == 'admin':
        return jsonify({'error': 'User is already an admin'}), 400
    
    users_db[username]['role'] = 'admin'
    return jsonify({'success': True, 'message': f'{username} promoted to admin'})

@app.route('/api/users/demote', methods=['POST'])
@login_required
def demote_user():
    """Demote an admin to user (Organizer only)"""
    if not current_user.is_organizer():
        return jsonify({'error': 'Organizer access required'}), 403
    
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    if username not in users_db:
        return jsonify({'error': 'User not found'}), 404
    
    if username == 'organizer':
        return jsonify({'error': 'Cannot demote the organizer account'}), 400
    
    if username == 'admin':
        return jsonify({'error': 'Cannot demote the default admin account'}), 400
    
    if username == current_user.username:
        return jsonify({'error': 'Cannot demote yourself'}), 400
    
    if users_db[username]['role'] == 'user':
        return jsonify({'error': 'User is already a regular user'}), 400
    
    users_db[username]['role'] = 'user'
    return jsonify({'success': True, 'message': f'{username} demoted to user'})

@app.route('/api/users/delete', methods=['POST'])
@login_required
def delete_user():
    """Delete a user (Organizer only)"""
    if not current_user.is_organizer():
        return jsonify({'error': 'Organizer access required'}), 403
    
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    if username not in users_db:
        return jsonify({'error': 'User not found'}), 404
    
    if username == 'organizer':
        return jsonify({'error': 'Cannot delete the organizer account'}), 400
    
    if username == 'admin':
        return jsonify({'error': 'Cannot delete the default admin account'}), 400
    
    if username == current_user.username:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    del users_db[username]
    return jsonify({'success': True, 'message': f'{username} deleted successfully'})


def format_bytes(bytes_value):
    """Format bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.2f} PB"

if __name__ == '__main__':
    print("==" * 30)
    print("NetLimiter - Bandwidth Control Application")
    print("==" * 30)
    print("\nStarting server...")
    print("Access the application at: http://localhost:8080")
    print("\nPress Ctrl+C to stop the server")
    print("==" * 30)
    
    app.run(debug=False, host='0.0.0.0', port=8080)
