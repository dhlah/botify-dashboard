# Botify Dashboard - MQTT Device Management System

A comprehensive IoT device management dashboard with MQTT broker integration, real-time monitoring, and Telegram notifications for ESP32 devices and other IoT hardware.

## 🚀 Features

- **MQTT Broker**: Built-in Aedes MQTT broker for device communication
- **Device Management**: Register, authenticate, and manage IoT devices
- **Real-time Monitoring**: Live device status tracking with WebSocket integration
- **Data Logging**: Comprehensive device value history with timestamp tracking
- **Telegram Notifications**: Instant alerts for device status changes
- **Time Range Analytics**: Query device data by various time periods
- **Web Dashboard**: EJS-based responsive UI for device visualization
- **CLI Interface**: Command-line tool for device management and system control
- **Multi-instance Support**: Support for multiple device registrations

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn** or **bun**
- **Telegram Bot Token** (optional, for notifications)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd botify-dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
API_PORT=3000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=botify_db

# MQTT Broker Configuration
MQTT_BROKER_PORT=1883
MQTT_WS_PORT=8883

# Telegram Configuration (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=true
LOG_DIR=./logs
```

### 4. Database Setup
Execute the database schema SQL script in MySQL:

```bash
mysql -u root -p botify_db < DATABASE_SCHEMA.sql
```

Or manually create the database:
```sql
CREATE DATABASE botify_db;
USE botify_db;

-- Then execute the schema from DATABASE_SCHEMA.md
```

## 🚀 Getting Started

### Development Mode
```bash
npm run dev
# or
bun run dev
```

### Production Mode
```bash
npm start
# or
bun src/server.js
```

The dashboard will be available at:
- **Web UI**: `http://localhost:3000/device`
- **MQTT Broker**: `mqtt://localhost:1883`
- **WebSocket**: `ws://localhost:3000/socket.io`

## 📡 API Endpoints

### Device Management

#### Get All Devices
```http
GET /device
```
Returns an HTML page with all registered devices.

#### Get Device Details
```http
GET /device/:id
```
Returns device information with the latest value.

#### Get Device Logs
```http
GET /device/:id/logs?timeRange=1h&limit=100
```
Renders device logs with time range filtering.

#### Device Logs API (JSON)
```http
GET /api/device/:id/logs?timeRange=1h&limit=100&startDate=2024-01-01&endDate=2024-12-31
```

Query Parameters:
- `timeRange`: `10m`, `1h`, `1d`, `1month`, `1year`, `thisMonth`, `thisYear`, `lastMonth`, `custom`
- `limit`: Maximum number of records (1-100)
- `startDate`: Start date for custom range (ISO format)
- `endDate`: End date for custom range (ISO format)

### API Response Format
```json
{
  "success": true,
  "deviceId": "device-001",
  "timeRange": "1h",
  "limit": 100,
  "logs": [
    {
      "id": "uuid-xxx",
      "device_id": "device-001",
      "value": "25.5",
      "timestamp": "2024-03-09 14:30:45"
    }
  ]
}
```

## 🗄️ Database Schema

The system uses **MySQL** database with the following main tables:

### Tables Overview
1. **device** - Stores IoT device information
2. **device_values** - Stores device sensor readings and data points

For detailed schema information, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

### Key Fields

**device table:**
- `id`: Device identifier (Primary Key)
- `name`: Human-readable device name
- `token`: MQTT authentication token
- `deviceState`: Current status (online/offline)
- `chatId`: Telegram chat ID for notifications
- `owner`: Device owner identifier
- `lastConnection`: Last connection timestamp

**device_values table:**
- `id`: Unique value record ID (UUID)
- `device_id`: Reference to device
- `value`: Sensor reading or status value
- `timestamp`: When the value was recorded

## 📁 Project Structure

```
botify-dashboard/
├── src/
│   ├── server.js              # Main Express server
│   ├── broker.js              # MQTT Broker initialization
│   ├── functions/             # Core business logic
│   │   ├── register-new-device.js
│   │   ├── authenticate-devices.js
│   │   ├── get-all-device.js
│   │   ├── get-device-info.js
│   │   ├── save-value-to-database.js
│   │   ├── update-status-device.js
│   │   ├── get-log-value-device.js
│   │   └── get-log-value-device-by-range.js
│   ├── lib/
│   │   ├── db/
│   │   │   └── connection.js  # MySQL connection pool
│   │   ├── logger/            # Logging system
│   │   ├── cli/               # Command-line interface
│   │   ├── registry/          # Device registry
│   │   └── telegram/          # Telegram integration
│   ├── routes/
│   │   └── deviceRoutes.js    # Express routes
│   ├── services/              # External services
│   └── views/                 # EJS templates
├── public/                    # Static files (CSS, JS)
├── logs/                      # Application logs
├── package.json
├── tailwind.config.js
├── .env                       # Environment variables
└── README.md
```

## 🔌 MQTT Topics

### Device Status
```
device/{deviceId}/status
Payload: {"state": "online|offline", "lastConnection": "timestamp"}
```

### Device Values
```
device/{deviceId}/value
Payload: numeric or string value
```

### Device Update
```
device/{deviceId}/update
Payload: JSON with device information
```

## 🔐 Authentication

### MQTT Device Authentication
Devices authenticate using:
- **Username**: Device ID
- **Password**: Device Token

### API Authentication
Currently, the API is open. For production, implement:
- API Key tokens
- JWT authentication
- Rate limiting

## 📊 Data Flow

```
ESP32 Device
    ↓
    ├→ MQTT Publish (device/{id}/value)
    ↓
Aedes MQTT Broker
    ↓
    ├→ Aedes Handler Routes Message
    ├→ Save Value to Database
    ├→ Update Device Status
    ├→ Send Telegram Notification
    ↓
Socket.IO Broadcast
    ↓
Web Dashboard (Real-time Update)
```

## 🛠️ CLI Commands

The system includes a command-line interface for management:

```bash
# Start with CLI
npm run dev

# Available commands
help              - Show available commands
list-devices      - Display all registered devices
device-info       - Get device information
device-status     - Check device status
register          - Register new device
```

For more CLI information, see [CLI_GUIDE.md](md-files/CLI_GUIDE.md)

## 📝 Logging System

The application uses a comprehensive logging system:

**Log Levels:**
- `ERROR` - System errors
- `WARN` - Warnings and alerts
- `INFO` - General information
- `DEBUG` - Detailed debugging information

**Configuration:** See [LOGGER_GUIDE.md](md-files/LOGGER_GUIDE.md)

**Log Files:** Stored in `./logs/` directory

## 🔔 Telegram Notifications

The system can send device notifications via Telegram:

- Device online/offline status
- Relay state changes
- Error alerts
- Custom notifications

**Configuration:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

See [TELEGRAM_GUIDE.md](md-files/TELEGRAM_GUIDE.md) for setup instructions.

## 🚨 Common Issues

### Database Connection Error
**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
1. Ensure MySQL is running: `sudo service mysql start`
2. Verify connection credentials in `.env`
3. Check if database exists: `CREATE DATABASE botify_db;`

### Port Already in Use
**Error:** `listen EADDRINUSE :::3000`

**Solution:**
1. Change `API_PORT` in `.env`
2. Or kill the process: `lsof -i :3000` then `kill -9 <PID>`

### MQTT Connection Issues
**Error:** `Cannot connect to MQTT broker`

**Solution:**
1. Ensure broker is running in the application
2. Check `MQTT_BROKER_PORT` in `.env`
3. Verify firewall settings

## 📈 Performance Tips

1. **Database Optimization**:
   - Create indexes on frequently queried columns
   - Archive old data periodically
   - Use time range queries efficiently

2. **Logging**:
   - Adjust `LOG_LEVEL` to reduce log volume
   - Implement log rotation

3. **Memory Management**:
   - Monitor device count
   - Implement connection pooling
   - Clean up disconnected devices

## 🔄 Updates & Maintenance

For changelog and updates, see [CHANGELOG.md](md-files/CHANGELOG.md)

### Regular Maintenance Tasks
1. Database backup
2. Log rotation
3. Device registry cleanup
4. Telegram token refresh

## 📚 Additional Documentation

- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Complete database schema
- [FUNCTION_AUDIT.md](FUNCTION_AUDIT.md) - Function and database usage audit
- [CLI_GUIDE.md](md-files/CLI_GUIDE.md) - Command-line interface guide
- [LOGGER_GUIDE.md](md-files/LOGGER_GUIDE.md) - Logging system documentation
- [FEATURES.md](md-files/FEATURES.md) - Feature list and descriptions
- [PROJECT_STRUCTURE.md](md-files/PROJECT_STRUCTURE.md) - Detailed project structure

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Send pull request

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Botify Dashboard Project Team

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check existing documentation
- Review TROUBLESHOOTING.md

---

**Last Updated:** March 2024
**Version:** 1.0.0
