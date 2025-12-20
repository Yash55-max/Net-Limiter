# NetLimiter - Bandwidth Control Application

A powerful, modern bandwidth monitoring and control application that allows you to monitor network traffic and set bandwidth limits for individual processes.

![NetLimiter Dashboard](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### 🚀 Core Features
- **Real-time Network Monitoring**: Monitor upload/download speeds across all network interfaces
- **Process-Level Control**: View and control bandwidth for individual applications
- **Connection Tracking**: See all active network connections with detailed information
- **Bandwidth Limiting**: Set upload/download speed limits per process
- **Beautiful Dashboard**: Modern, responsive UI with real-time charts
- **Multi-Interface Support**: Monitor multiple network adapters simultaneously

### 📊 Dashboard
- Live bandwidth usage graphs
- Total data sent/received statistics
- Network interface details
- Real-time speed monitoring

### 🔧 Process Management
- View all processes with network activity
- Monitor read/write bytes per process
- Set custom bandwidth limits (KB/s)
- Remove limits easily
- Search and filter processes

### 🌐 Connection Monitoring
- View all TCP/UDP connections
- Filter by connection type and status
- See local and remote addresses
- Track connection states

### 📋 Rules Management
- Configure bandwidth limitation rules
- View all active rules
- Easy rule removal
- Persistent rule storage

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Administrator/root privileges (required for network monitoring)

### Step 1: Clone or Download
Download the NetLimiter files to your computer.

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the Application
**Windows (Run as Administrator):**
```bash
python netlimiter.py
```

**Linux/Mac (Run with sudo):**
```bash
sudo python3 netlimiter.py
```

### Step 4: Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage Guide

### Monitoring Network Traffic
1. Open the application in your browser
2. The **Dashboard** shows real-time network statistics
3. View upload/download speeds and total data transferred
4. Monitor individual network interfaces

### Setting Bandwidth Limits
1. Navigate to the **Processes** tab
2. Find the process you want to limit
3. Click **Set Limit** button
4. Enter upload and/or download limits in KB/s
5. Click **Apply Limit**

### Viewing Connections
1. Go to the **Connections** tab
2. See all active network connections
3. Filter by connection type (TCP/UDP) or status
4. Monitor which processes are connecting where

### Managing Rules
1. Visit the **Rules** tab
2. View all active bandwidth limitation rules
3. Remove rules as needed

## Technical Details

### Architecture
- **Backend**: Python Flask server with psutil for system monitoring
- **Frontend**: Vanilla JavaScript with HTML5 Canvas for charts
- **Styling**: Modern CSS with glassmorphism and gradient effects
- **Real-time Updates**: AJAX polling every 2 seconds

### API Endpoints
- `GET /api/network/stats` - System network statistics
- `GET /api/network/interfaces` - Network interface details
- `GET /api/network/bandwidth` - Bandwidth usage history
- `GET /api/processes` - Processes with network activity
- `GET /api/connections` - Active network connections
- `GET /api/limits` - Current bandwidth limits
- `POST /api/limit/set` - Set bandwidth limit
- `POST /api/limit/remove` - Remove bandwidth limit

### Security Notes
⚠️ **Important**: This application requires elevated privileges to monitor network traffic and control processes. Always run it as Administrator (Windows) or with sudo (Linux/Mac).

## Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## System Requirements
- **OS**: Windows 10/11, Linux, macOS
- **RAM**: 100MB minimum
- **Python**: 3.8+
- **Permissions**: Administrator/root access

## Troubleshooting

### "Access Denied" Errors
- Make sure you're running the application with administrator/root privileges
- On Windows: Right-click and "Run as Administrator"
- On Linux/Mac: Use `sudo`

### Port Already in Use
If port 5000 is already in use, you can change it in `netlimiter.py`:
```python
app.run(debug=False, host='0.0.0.0', port=5001)  # Change port here
```

### No Processes Showing
- Ensure you have active network connections
- Try refreshing the page
- Check that you have proper permissions

## Limitations
- **Note**: The actual bandwidth limiting functionality requires OS-level traffic shaping which varies by platform. This application provides the monitoring and UI framework. For actual traffic control on:
  - **Windows**: Use Windows QoS or third-party drivers
  - **Linux**: Integrate with tc (traffic control)
  - **macOS**: Use pfctl or dummynet

## Future Enhancements
- [ ] Persistent rule storage (database)
- [ ] Historical data analytics
- [ ] Export reports (CSV/PDF)
- [ ] Custom alert thresholds
- [ ] Dark/Light theme toggle
- [ ] Multi-user support
- [ ] API authentication

## Contributing
Contributions are welcome! Feel free to submit issues and pull requests.

## License
MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer
This tool is for educational and legitimate network management purposes only. Always ensure you have proper authorization before monitoring or controlling network traffic.

## Support
For issues, questions, or suggestions, please create an issue in the repository.

---

**Made with ❤️ for network administrators and power users**
