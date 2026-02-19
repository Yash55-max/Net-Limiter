// NetLimiter - Frontend JavaScript
let currentView = 'dashboard';
let updateInterval;
let bandwidthChart;
let currentProcessPID = null;
let currentTheme = localStorage.getItem('theme') || 'dark';
let sidebarHidden = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeSidebarToggle();
    initializeNavigation();
    initializeChart();
    startDataUpdates();

    // Event listeners
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('processSearch').addEventListener('input', filterProcesses);
    document.getElementById('connectionFilter').addEventListener('change', filterConnections);
    document.getElementById('themeSwitcher').addEventListener('click', toggleTheme);
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
});

// Theme Management
function initializeTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        currentTheme = 'dark';
    } else {
        document.body.classList.add('light-theme');
        currentTheme = 'light';
    }
    localStorage.setItem('theme', currentTheme);
}

// Sidebar Toggle
function initializeSidebarToggle() {
    // Sidebar toggle is handled by CSS on mobile
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('hidden');
    sidebarHidden = !sidebarHidden;
}

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Get view name
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    currentView = view;

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'processes': 'Processes',
        'connections': 'Connections',
        'rules': 'Bandwidth Rules',
        'users': 'User Management'
    };

    const subtitles = {
        'dashboard': 'Real-time network monitoring and control',
        'processes': 'Manage bandwidth for active processes',
        'connections': 'View all active network connections',
        'rules': 'Configure bandwidth limitation rules',
        'users': 'Manage user accounts and permissions'
    };

    document.getElementById('page-title').textContent = titles[view];
    document.getElementById('page-subtitle').textContent = subtitles[view];

    // Refresh data for the new view
    refreshData();

    // Auto-load process dropdown when entering Rules view
    if (view === 'rules') {
        reloadProcessDropdown();
    }
}

// Chart Initialization
function initializeChart() {
    const ctx = document.getElementById('bandwidthChart');
    if (!ctx) return;

    const canvas = ctx.getContext('2d');

    bandwidthChart = {
        canvas: canvas,
        ctx: ctx,
        data: {
            labels: [],
            upload: [],
            download: []
        },
        draw: function () {
            const width = this.ctx.width;
            const height = this.ctx.height;
            const padding = 40;

            // Clear canvas
            this.canvas.clearRect(0, 0, width, height);

            if (this.data.upload.length === 0) {
                this.canvas.fillStyle = '#6b6b8f';
                this.canvas.font = '14px Inter';
                this.canvas.textAlign = 'center';
                this.canvas.fillText('Waiting for data...', width / 2, height / 2);
                return;
            }

            // Find max value for scaling
            const maxValue = Math.max(...this.data.upload, ...this.data.download, 1);

            // Draw grid
            this.canvas.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.canvas.lineWidth = 1;

            for (let i = 0; i <= 5; i++) {
                const y = padding + (height - padding * 2) * (i / 5);
                this.canvas.beginPath();
                this.canvas.moveTo(padding, y);
                this.canvas.lineTo(width - padding, y);
                this.canvas.stroke();

                // Y-axis labels
                this.canvas.fillStyle = '#a0a0c0';
                this.canvas.font = '12px Inter';
                this.canvas.textAlign = 'right';
                const value = formatBytes(maxValue * (1 - i / 5));
                this.canvas.fillText(value + '/s', padding - 10, y + 4);
            }

            // Draw upload line
            this.drawLine(this.data.upload, maxValue, '#f093fb', padding, width, height);

            // Draw download line
            this.drawLine(this.data.download, maxValue, '#4facfe', padding, width, height);

            // Legend
            this.drawLegend(width, padding);
        },
        drawLine: function (data, maxValue, color, padding, width, height) {
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            const step = chartWidth / Math.max(data.length - 1, 1);

            // Draw gradient fill
            const gradient = this.canvas.createLinearGradient(0, padding, 0, height - padding);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(1, color + '00');

            this.canvas.beginPath();
            this.canvas.moveTo(padding, height - padding);

            data.forEach((value, index) => {
                const x = padding + step * index;
                const y = height - padding - (value / maxValue) * chartHeight;
                this.canvas.lineTo(x, y);
            });

            this.canvas.lineTo(padding + step * (data.length - 1), height - padding);
            this.canvas.closePath();
            this.canvas.fillStyle = gradient;
            this.canvas.fill();

            // Draw line
            this.canvas.beginPath();
            data.forEach((value, index) => {
                const x = padding + step * index;
                const y = height - padding - (value / maxValue) * chartHeight;

                if (index === 0) {
                    this.canvas.moveTo(x, y);
                } else {
                    this.canvas.lineTo(x, y);
                }
            });

            this.canvas.strokeStyle = color;
            this.canvas.lineWidth = 2;
            this.canvas.stroke();
        },
        drawLegend: function (width, padding) {
            const legendX = width - padding - 150;
            const legendY = padding + 10;

            // Upload
            this.canvas.fillStyle = '#f093fb';
            this.canvas.fillRect(legendX, legendY, 20, 3);
            this.canvas.fillStyle = '#ffffff';
            this.canvas.font = '12px Inter';
            this.canvas.textAlign = 'left';
            this.canvas.fillText('Upload', legendX + 30, legendY + 3);

            // Download
            this.canvas.fillStyle = '#4facfe';
            this.canvas.fillRect(legendX, legendY + 20, 20, 3);
            this.canvas.fillStyle = '#ffffff';
            this.canvas.fillText('Download', legendX + 30, legendY + 23);
        }
    };

    // Set canvas size
    const resizeCanvas = () => {
        const container = ctx.parentElement;
        ctx.width = container.clientWidth - 64;
        ctx.height = 300;
        bandwidthChart.draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// Data Updates
function startDataUpdates() {
    refreshData();
    updateInterval = setInterval(refreshData, 2000); // Update every 2 seconds
}

async function refreshData() {
    try {
        if (currentView === 'dashboard') {
            await updateDashboard();
        } else if (currentView === 'processes') {
            await updateProcesses();
        } else if (currentView === 'connections') {
            await updateConnections();
        } else if (currentView === 'rules') {
            await updateRules();
        } else if (currentView === 'users') {
            await updateUsers();
        }
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

async function updateDashboard() {
    try {
        // Get network stats
        const statsResponse = await fetch('/api/network/stats');
        const stats = await statsResponse.json();

        // Update stat cards
        document.getElementById('totalSent').textContent = formatBytes(stats.total_bytes_sent);
        document.getElementById('totalReceived').textContent = formatBytes(stats.total_bytes_recv);

        // Get current speeds
        const speedResponse = await fetch('/api/network/current-speed');
        const speeds = await speedResponse.json();

        // Update speed displays
        document.getElementById('uploadSpeed').textContent = formatBytes(speeds.upload_speed) + '/s';
        document.getElementById('downloadSpeed').textContent = formatBytes(speeds.download_speed) + '/s';

        // Get bandwidth data for chart
        const bandwidthResponse = await fetch('/api/network/bandwidth');
        const bandwidth = await bandwidthResponse.json();

        // Update chart with aggregated data from all interfaces
        let aggregatedUpload = [];
        let aggregatedDownload = [];
        let maxLength = 0;

        // Find the maximum length of history
        for (const interfaceData of Object.values(bandwidth)) {
            if (interfaceData.length > maxLength) {
                maxLength = interfaceData.length;
            }
        }

        // Initialize arrays
        for (let i = 0; i < maxLength; i++) {
            aggregatedUpload[i] = 0;
            aggregatedDownload[i] = 0;
        }

        // Aggregate data from all interfaces
        for (const interfaceData of Object.values(bandwidth)) {
            interfaceData.forEach((dataPoint, index) => {
                aggregatedUpload[index] += dataPoint.upload_speed;
                aggregatedDownload[index] += dataPoint.download_speed;
            });
        }

        // Update chart data
        if (maxLength > 0) {
            bandwidthChart.data.upload = aggregatedUpload;
            bandwidthChart.data.download = aggregatedDownload;
            bandwidthChart.draw();
        }

        // Get interfaces
        const interfacesResponse = await fetch('/api/network/interfaces');
        const interfaces = await interfacesResponse.json();

        updateInterfacesList(interfaces);

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateInterfacesList(interfaces) {
    const container = document.getElementById('interfacesList');

    const html = Object.entries(interfaces).map(([name, data]) => `
        <div class="interface-item">
            <div class="interface-header">
                <div class="interface-name">${name}</div>
            </div>
            <div class="interface-stats">
                <div class="interface-stat">
                    <span class="interface-stat-label">Bytes Sent</span>
                    <span class="interface-stat-value">${formatBytes(data.bytes_sent)}</span>
                </div>
                <div class="interface-stat">
                    <span class="interface-stat-label">Bytes Received</span>
                    <span class="interface-stat-value">${formatBytes(data.bytes_recv)}</span>
                </div>
                <div class="interface-stat">
                    <span class="interface-stat-label">Packets Sent</span>
                    <span class="interface-stat-value">${data.packets_sent.toLocaleString()}</span>
                </div>
                <div class="interface-stat">
                    <span class="interface-stat-label">Packets Received</span>
                    <span class="interface-stat-value">${data.packets_recv.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

async function updateProcesses() {
    try {
        const response = await fetch('/api/processes');
        const processes = await response.json();

        const tbody = document.getElementById('processesTable');

        const html = processes.map(proc => `
            <tr>
                <td><strong>${proc.name}</strong></td>
                <td>${proc.pid}</td>
                <td>${proc.connections}</td>
                <td>${formatBytes(proc.read_bytes)}</td>
                <td>${formatBytes(proc.write_bytes)}</td>
                <td>${proc.upload_limit ? proc.upload_limit + ' KB/s' : 'No limit'}</td>
                <td>${proc.download_limit ? proc.download_limit + ' KB/s' : 'No limit'}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="openLimitModal(${proc.pid}, '${proc.name}')">
                        Set Limit
                    </button>
                    ${proc.upload_limit || proc.download_limit ?
                `<button class="btn btn-danger btn-small" onclick="removeLimit(${proc.pid})">Remove</button>`
                : ''}
                </td>
            </tr>
    `).join('');

        tbody.innerHTML = html || '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">No active network processes</td></tr>';

    } catch (error) {
        console.error('Error updating processes:', error);
    }
}

async function updateConnections() {
    try {
        const response = await fetch('/api/connections');
        const connections = await response.json();

        const filter = document.getElementById('connectionFilter').value;
        const filtered = connections.filter(conn => {
            if (filter === 'all') return true;
            if (filter === 'TCP' || filter === 'UDP') return conn.type === filter;
            return conn.status === filter;
        });

        const tbody = document.getElementById('connectionsTable');

        const html = filtered.map(conn => `
            <tr>
                <td><strong>${conn.name}</strong></td>
                <td>${conn.pid}</td>
                <td><span class="badge badge-${conn.type === 'TCP' ? 'success' : 'warning'}">${conn.type}</span></td>
                <td>${conn.local_addr}</td>
                <td>${conn.remote_addr}</td>
                <td><span class="badge badge-${conn.status === 'ESTABLISHED' ? 'success' : 'warning'}">${conn.status}</span></td>
            </tr>
    `).join('');

        tbody.innerHTML = html || '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No connections found</td></tr>';

    } catch (error) {
        console.error('Error updating connections:', error);
    }
}

// Store process list for name lookups in rules
let cachedProcessList = [];

async function updateRules() {
    try {
        const [limitsRes, processesRes] = await Promise.all([
            fetch('/api/limits'),
            fetch('/api/processes')
        ]);
        const limits = await limitsRes.json();
        const processes = await processesRes.json();

        // Cache for name lookup
        cachedProcessList = processes;

        // Build pid→name map
        const pidNameMap = {};
        processes.forEach(p => { pidNameMap[p.pid] = p.name; });

        const container = document.getElementById('rulesList');
        const count = Object.keys(limits).length;

        // Update badge
        const badge = document.getElementById('rulesCount');
        if (badge) badge.textContent = `${count} Rule${count !== 1 ? 's' : ''}`;

        if (count === 0) {
            container.innerHTML = `
                <div class="rules-empty">
                    <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    <p>No bandwidth rules configured yet.</p>
                    <p class="rules-empty-sub">Use the form above to add your first rule.</p>
                </div>`;
            return;
        }

        const html = Object.entries(limits).map(([pid, limit]) => {
            const name = pidNameMap[pid] || `PID ${pid}`;
            const uploadBadge = limit.upload
                ? `<div class="rule-limit-badge upload-badge">
                       <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                       Upload: <strong>${limit.upload} KB/s</strong>
                   </div>`
                : `<div class="rule-limit-badge no-limit-badge">Upload: No limit</div>`;
            const downloadBadge = limit.download
                ? `<div class="rule-limit-badge download-badge">
                       <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                       Download: <strong>${limit.download} KB/s</strong>
                   </div>`
                : `<div class="rule-limit-badge no-limit-badge">Download: No limit</div>`;

            return `
            <div class="rule-item">
                <div class="rule-item-left">
                    <div class="rule-process-icon">
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 21H16M12 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="rule-item-info">
                        <h4 class="rule-process-name">${name}</h4>
                        <span class="rule-pid-badge">PID: ${pid}</span>
                    </div>
                </div>
                <div class="rule-limits-row">
                    ${uploadBadge}
                    ${downloadBadge}
                </div>
                <div class="rule-item-actions">
                    <button class="btn btn-secondary btn-small" onclick="editRule(${pid}, '${name}', ${limit.upload || ''}, ${limit.download || ''})">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="removeLimit(${pid})">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 6H21M19 6L18.1 20.1C18.05 20.6 17.6 21 17.1 21H6.9C6.4 21 5.95 20.6 5.9 20.1L5 6M9 6V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Remove
                    </button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = html;

    } catch (error) {
        console.error('Error updating rules:', error);
    }
}

// Load running processes into the dropdown
async function reloadProcessDropdown() {
    const select = document.getElementById('ruleProcessSelect');
    if (!select) return;
    select.innerHTML = '<option value="">⟳ Loading...</option>';
    try {
        const response = await fetch('/api/processes');
        const processes = await response.json();
        cachedProcessList = processes;

        if (processes.length === 0) {
            select.innerHTML = '<option value="">No active network processes found</option>';
            return;
        }

        const opts = ['<option value="">— Select a process —</option>'];
        processes.forEach(p => {
            opts.push(`<option value="${p.pid}" data-name="${p.name}">${p.name} (PID: ${p.pid})</option>`);
        });
        select.innerHTML = opts.join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load — enter PID manually</option>';
    }
}

function onProcessSelectChange() {
    const select = document.getElementById('ruleProcessSelect');
    const selected = select.options[select.selectedIndex];
    if (selected && selected.value) {
        document.getElementById('rulePID').value = selected.value;
        document.getElementById('ruleProcessName').value = selected.dataset.name || '';
    } else {
        document.getElementById('rulePID').value = '';
        document.getElementById('ruleProcessName').value = '';
    }
}

function setPreset(fieldId, value) {
    document.getElementById(fieldId).value = value;
}

function clearRuleForm() {
    document.getElementById('ruleProcessSelect').value = '';
    document.getElementById('rulePID').value = '';
    document.getElementById('ruleProcessName').value = '';
    document.getElementById('ruleUploadLimit').value = '';
    document.getElementById('ruleDownloadLimit').value = '';
}

function editRule(pid, name, uploadLimit, downloadLimit) {
    // Scroll to form
    document.querySelector('.rule-add-card').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('rulePID').value = pid;
    document.getElementById('ruleProcessName').value = name;
    document.getElementById('ruleUploadLimit').value = uploadLimit || '';
    document.getElementById('ruleDownloadLimit').value = downloadLimit || '';
    // Try to select it in the dropdown too
    const select = document.getElementById('ruleProcessSelect');
    for (let opt of select.options) {
        if (opt.value == pid) { select.value = pid; break; }
    }
}

async function applyRuleFromForm() {
    const pid = parseInt(document.getElementById('rulePID').value);
    const uploadLimit = document.getElementById('ruleUploadLimit').value;
    const downloadLimit = document.getElementById('ruleDownloadLimit').value;

    if (!pid || pid < 1) {
        showToast('Please select a process or enter a valid PID.', 'error');
        return;
    }
    if (!uploadLimit && !downloadLimit) {
        showToast('Enter at least one limit (upload or download).', 'error');
        return;
    }

    try {
        const btn = document.querySelector('.rule-apply-btn');
        btn.disabled = true;
        btn.textContent = 'Applying...';

        const response = await fetch('/api/limit/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pid: pid,
                upload_limit: uploadLimit ? parseInt(uploadLimit) : null,
                download_limit: downloadLimit ? parseInt(downloadLimit) : null
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('✓ Bandwidth rule applied successfully!', 'success');
            clearRuleForm();
            await updateRules();
        } else {
            showToast('✗ ' + (result.error || 'Failed to apply rule. Admin access required.'), 'error');
        }
    } catch (error) {
        showToast('✗ Network error. Make sure you are logged in as Admin.', 'error');
    } finally {
        const btn = document.querySelector('.rule-apply-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Apply Rule`;
        }
    }
}

// Toast notification helper
function showToast(message, type = 'success') {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        document.body.appendChild(toast);
    }
    toast.className = `app-toast app-toast-${type} show`;
    toast.textContent = message;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}



// User Management Functions
async function updateUsers() {
    try {
        const response = await fetch('/api/users');

        if (!response.ok) {
            console.error('Failed to fetch users');
            return;
        }

        const users = await response.json();
        const tbody = document.getElementById('usersTable');

        // Update stats
        const totalUsers = users.length;
        const totalAdmins = users.filter(u => u.role === 'admin').length;
        document.getElementById('totalUsers').textContent = `${totalUsers} User${totalUsers !== 1 ? 's' : ''}`;
        document.getElementById('totalAdmins').textContent = `${totalAdmins} Admin${totalAdmins !== 1 ? 's' : ''}`;

        const html = users.map(user => `
            <tr>
                <td>
                    <strong>${user.username}</strong>
                    ${user.username === 'admin' ? '<span class="admin-badge">Default</span>' : ''}
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge badge-${user.role === 'admin' ? 'success' : 'warning'}">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td>
                    ${user.role === 'user' ?
                `<button class="btn btn-primary btn-small" onclick="promoteUser('${user.username}')">
                            Promote to Admin
                        </button>` :
                user.username !== 'admin' ?
                    `<button class="btn btn-secondary btn-small" onclick="demoteUser('${user.username}')">
                            Demote to User
                        </button>` :
                    '<span style="color: var(--text-muted);">Protected</span>'
            }
                    ${user.username !== 'admin' ?
                `<button class="btn btn-danger btn-small" onclick="deleteUser('${user.username}')">
                            Delete
                        </button>` : ''
            }
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html || '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No users found</td></tr>';

    } catch (error) {
        console.error('Error updating users:', error);
    }
}

async function promoteUser(username) {
    if (!confirm(`Are you sure you want to promote "${username}" to admin?\n\nAdmins can:\n• Set bandwidth limits\n• Manage all users\n• Access all features`)) {
        return;
    }

    try {
        const response = await fetch('/api/users/promote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✓ ${result.message}`);
            await updateUsers();
        } else {
            alert(`✗ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error promoting user:', error);
        alert('Failed to promote user');
    }
}

async function demoteUser(username) {
    if (!confirm(`Are you sure you want to demote "${username}" to regular user?\n\nThey will lose:\n• Ability to set bandwidth limits\n• User management access\n• Admin privileges`)) {
        return;
    }

    try {
        const response = await fetch('/api/users/demote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✓ ${result.message}`);
            await updateUsers();
        } else {
            alert(`✗ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error demoting user:', error);
        alert('Failed to demote user');
    }
}

async function deleteUser(username) {
    if (!confirm(`⚠️ WARNING: Are you sure you want to DELETE "${username}"?\n\nThis action CANNOT be undone!\n\nThe user will:\n• Lose all access immediately\n• Be unable to log in\n• Have their account permanently removed`)) {
        return;
    }

    // Double confirmation for delete
    if (!confirm(`Final confirmation: Delete user "${username}"?`)) {
        return;
    }

    try {
        const response = await fetch('/api/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✓ ${result.message}`);
            await updateUsers();
        } else {
            alert(`✗ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
    }
}

// Modal Functions
function openLimitModal(pid, processName) {
    currentProcessPID = pid;
    document.getElementById('modalProcessName').value = processName;
    document.getElementById('modalPID').value = pid;
    document.getElementById('uploadLimit').value = '';
    document.getElementById('downloadLimit').value = '';
    document.getElementById('limitModal').classList.add('active');
}

function closeLimitModal() {
    document.getElementById('limitModal').classList.remove('active');
    currentProcessPID = null;
}

async function applyLimit() {
    const uploadLimit = document.getElementById('uploadLimit').value;
    const downloadLimit = document.getElementById('downloadLimit').value;

    if (!uploadLimit && !downloadLimit) {
        alert('Please enter at least one limit value');
        return;
    }

    try {
        const response = await fetch('/api/limit/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pid: currentProcessPID,
                upload_limit: uploadLimit ? parseInt(uploadLimit) : null,
                download_limit: downloadLimit ? parseInt(downloadLimit) : null
            })
        });

        const result = await response.json();

        if (result.success) {
            closeLimitModal();
            refreshData();
        } else {
            alert('Failed to set limit');
        }
    } catch (error) {
        console.error('Error setting limit:', error);
        alert('Error setting limit');
    }
}

async function removeLimit(pid) {
    if (!confirm('Are you sure you want to remove the bandwidth limit for this process?')) {
        return;
    }

    try {
        const response = await fetch('/api/limit/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pid: pid })
        });

        const result = await response.json();

        if (result.success) {
            refreshData();
        } else {
            alert('Failed to remove limit');
        }
    } catch (error) {
        console.error('Error removing limit:', error);
        alert('Error removing limit');
    }
}

// Filter Functions
function filterProcesses() {
    const searchTerm = document.getElementById('processSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#processesTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterConnections() {
    updateConnections();
}

// Utility Functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('limitModal');
    if (e.target === modal) {
        closeLimitModal();
    }
});
