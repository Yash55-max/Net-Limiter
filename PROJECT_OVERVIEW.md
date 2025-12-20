# NetLimiter - Project Overview

## 📁 Project Structure

```
NetLimiter/
├── netlimiter.py              # Main Python backend server
├── requirements.txt           # Python dependencies
├── start_netlimiter.bat      # Windows startup script
├── README.md                 # Full documentation
├── QUICK_START.md           # Quick start guide
├── templates/
│   └── index.html           # Main HTML interface
└── static/
    ├── style.css            # Premium dark theme CSS
    └── script.js            # Frontend JavaScript logic
```

## 🎯 What This Application Does

NetLimiter is a **bandwidth monitoring and control application** that allows you to:

✅ **Monitor Network Traffic**
- Real-time upload/download speeds
- Total data sent and received
- Per-interface statistics
- Live bandwidth graphs

✅ **Control Process Bandwidth**
- View all processes using the network
- Set upload/download limits per process
- Remove limits easily
- Search and filter processes

✅ **Track Connections**
- See all TCP/UDP connections
- Filter by type and status
- View local and remote addresses
- Monitor connection states

✅ **Manage Rules**
- Configure bandwidth limitation rules
- View all active rules
- Quick rule management

## 🎨 Design Features

### Modern UI/UX
- **Dark Theme**: Premium dark mode with glassmorphism effects
- **Gradient Accents**: Beautiful purple/pink/blue gradients
- **Smooth Animations**: Micro-animations for better UX
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Auto-refresh every 2 seconds

### Color Scheme
- Background: Deep dark blue (#0f0f1e)
- Cards: Semi-transparent with blur effects
- Accents: Purple-pink gradients
- Upload: Pink (#f093fb)
- Download: Blue (#4facfe)
- Total: Yellow (#fee140)

### Typography
- Font: Inter (Google Fonts)
- Clean, modern, highly readable

## 🔧 Technical Stack

### Backend
- **Python 3.8+**
- **Flask**: Web framework
- **psutil**: System and network monitoring
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No frameworks, pure JS
- **Canvas API**: Custom chart rendering

### Architecture
- **RESTful API**: JSON-based communication
- **Real-time Polling**: 2-second update intervals
- **Threaded Monitoring**: Background network monitoring
- **Responsive Design**: Mobile-first approach

## 📊 Features Breakdown

### 1. Dashboard
**Components:**
- 4 stat cards (Upload, Download, Total Sent, Total Received)
- Live bandwidth chart (60-second history)
- Network interfaces list
- Auto-refresh functionality

**Technologies:**
- HTML5 Canvas for charts
- CSS Grid for layout
- Fetch API for data retrieval

### 2. Processes View
**Components:**
- Searchable process table
- Set limit modal dialog
- Remove limit functionality
- Real-time process monitoring

**Features:**
- Live process discovery
- Bandwidth limit configuration
- Process filtering
- Connection counting

### 3. Connections View
**Components:**
- Connection table
- Type/status filtering
- Address display
- Real-time updates

**Data Shown:**
- Process name and PID
- Connection type (TCP/UDP)
- Local/remote addresses
- Connection status

### 4. Rules View
**Components:**
- Active rules list
- Rule removal
- Limit display

**Functionality:**
- Centralized rule management
- Quick rule deletion
- Visual rule organization

## 🚀 How It Works

### Backend Flow
1. **Initialization**
   - Flask server starts on port 5000
   - Background monitoring thread begins
   - BandwidthController initializes

2. **Monitoring Loop**
   - Collects network stats every second
   - Calculates bandwidth differences
   - Stores 60-second history
   - Tracks process connections

3. **API Endpoints**
   - Serve data via REST API
   - Handle limit set/remove requests
   - Return JSON responses

### Frontend Flow
1. **Page Load**
   - Initialize navigation
   - Setup chart canvas
   - Start data update interval

2. **Data Updates**
   - Fetch from API every 2 seconds
   - Update UI elements
   - Redraw charts
   - Refresh tables

3. **User Interactions**
   - Navigation switching
   - Search/filter operations
   - Modal dialogs
   - Limit management

## 🎯 Use Cases

### Home Users
- Monitor which apps use bandwidth
- Limit background downloads
- Troubleshoot slow internet
- Track data usage

### Power Users
- Fine-tune application bandwidth
- Optimize for gaming/streaming
- Identify bandwidth hogs
- Network diagnostics

### Developers
- Test application network behavior
- Simulate bandwidth constraints
- Monitor API calls
- Debug network issues

### Network Administrators
- Monitor workstation traffic
- Enforce bandwidth policies
- Identify problematic processes
- Generate usage reports

## 📈 Future Enhancements

### Planned Features
- [ ] Database storage for historical data
- [ ] Export reports (CSV/PDF)
- [ ] Custom alert thresholds
- [ ] Email notifications
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Process grouping
- [ ] Scheduled rules
- [ ] Bandwidth quotas
- [ ] Advanced filtering

### Technical Improvements
- [ ] WebSocket for real-time updates
- [ ] Chart.js integration
- [ ] User authentication
- [ ] Settings persistence
- [ ] Logging system
- [ ] Performance optimization
- [ ] Unit tests
- [ ] Docker support

### Platform Integration
- [ ] Windows QoS integration
- [ ] Linux tc integration
- [ ] macOS pfctl integration
- [ ] System tray icon
- [ ] Startup service
- [ ] Installer package

## 🔒 Security Considerations

### Current Implementation
- Runs on localhost only (127.0.0.1)
- No external data transmission
- Requires admin privileges
- No authentication (local use)

### Recommendations
- Run only when needed
- Don't expose to network
- Keep Python updated
- Review process limits regularly

## 📝 Development Notes

### Code Organization
- **netlimiter.py**: Backend logic, API, monitoring
- **index.html**: UI structure, semantic HTML
- **style.css**: Styling, animations, responsive design
- **script.js**: Frontend logic, API calls, charts

### Best Practices Used
- Semantic HTML5 elements
- CSS custom properties (variables)
- Modular JavaScript functions
- RESTful API design
- Error handling
- Responsive design
- Accessibility considerations

### Performance
- Efficient polling intervals
- Minimal DOM manipulation
- Canvas-based charts (no libraries)
- Threaded backend monitoring
- Limited history storage (60s)

## 🎓 Learning Resources

### Technologies Used
- **Flask**: https://flask.palletsprojects.com/
- **psutil**: https://psutil.readthedocs.io/
- **HTML5 Canvas**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **CSS Grid**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### Design Inspiration
- Modern dashboard designs
- Glassmorphism UI trend
- Dark mode best practices
- Network monitoring tools

## 📞 Support & Contribution

### Getting Help
1. Check QUICK_START.md for common issues
2. Review README.md for detailed docs
3. Check browser console for errors
4. Verify admin privileges

### Contributing
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - Free to use, modify, and distribute.

---

**Built with ❤️ for network monitoring and bandwidth control**

Version: 1.0.0
Last Updated: December 2025
