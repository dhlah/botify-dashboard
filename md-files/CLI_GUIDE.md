# 🤖 Interactive CLI Console Guide

**Feature:** Interactive command-line interface for server monitoring and management  
**Status:** ✅ Fully Implemented  
**Date:** February 19, 2026

---

## 📋 Overview

The **Botify CLI Console** is an interactive command-line interface integrated into the running server. It provides real-time monitoring and management capabilities **without requiring server restart**.

### Key Benefits
- ✅ Real-time system & device monitoring
- ✅ No server restart needed
- ✅ Detailed system information
- ✅ Command history & autocomplete
- ✅ Production-safe display

---

## 🚀 Getting Started

### Starting the Server with CLI

```bash
npm start
```

or

```bash
node src/server.js
```

**Output:**
```
╭─────────────────────────────────────╮
│   🤖 BOTIFY SERVICE - CLI CONSOLE   │
╰─────────────────────────────────────╯

  Type "help" for available commands

botify> _
```

---

## 📝 Available Commands

### Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all available commands | `help` |
| `status` | Full server status & system info | `status` |
| `uptime` | Server and system uptime | `uptime` |
| `sysinfo` | Detailed system information | `sysinfo` |
| `devices` | List all connected devices | `devices` |
| `logs` | Show recent logs (default: 10) | `logs 20` |
| `memory` | Memory usage details | `memory` |
| `metrics` | System metrics summary | `metrics` |
| `clear` | Clear console screen | `clear` |
| `exit` | Stop server and exit | `exit` |

---

## 💻 Command Details

### 1. `help`
Shows all available commands with descriptions.

**Usage:**
```
botify> help
```

**Output:**
```
📋 Available Commands:
──────────────────────────────────────────────────
  help             → Show all available commands
  status           → Display server status & detailed system info
  uptime           → Show server uptime
  sysinfo          → Detailed system information
  devices          → List all connected devices
  logs             → Show recent logs
  memory           → Show memory usage details
  metrics          → Show system metrics
  clear            → Clear console screen
  exit             → Stop the server
──────────────────────────────────────────────────
```

---

### 2. `status`
Displays complete server status and system information.

**Usage:**
```
botify> status
```

**Output:**
```
🔍 SERVER STATUS & SYSTEM INFO
==================================================

📊 SERVER STATUS:
  Uptime           : 2m 15s
  Commands Exec    : 3
  Connected Dev    : 5
  Total Messages   : 342
  Avg Device Ping  : 45ms

💾 MEMORY:
  Usage            : 52.3 MB
  Percentage       : 45%

🖥️  SYSTEM INFO:
  Machine Name     : DESKTOP-ABC123
  OS               : Windows 10 19045
  Platform         : win32
  Architecture     : x64
  CPU Cores        : 8
  CPU Model        : Intel(R) Core(TM) i7-8700K
  System Uptime    : 45d 10h 32m 15s
  Memory Total     : 16 GB
  Memory Used      : 7.2 GB
  Memory Free      : 8.8 GB
  Memory Percent   : 45%
  Timezone         : Asia/Jakarta

🌐 NETWORK:
  Ethernet         : 192.168.1.100
  WiFi             : 10.0.0.50
==================================================
```

---

### 3. `uptime`
Shows server and system uptime.

**Usage:**
```
botify> uptime
```

**Output:**
```
⏱️  UPTIME INFORMATION
──────────────────────────────────────────────────
  Server Uptime    : 2m 30s
  System Uptime    : 45d 10h 32m 45s
  Current Time     : 19/02/2026, 14:30:45
──────────────────────────────────────────────────
```

---

### 4. `sysinfo`
Detailed system information including machine details, OS, CPU, memory, and network.

**Usage:**
```
botify> sysinfo
```

**Output:**
```
🖥️  DETAILED SYSTEM INFORMATION
==================================================
  Machine Name     : DESKTOP-ABC123
  OS Type          : Windows 10 19045
  Platform         : win32
  Architecture     : x64
  CPU Cores        : 8
  CPU Model        : Intel(R) Core(TM) i7-8700K
  Timezone         : Asia/Jakarta

  Memory Information:
    Total          : 16 GB
    Used           : 7.2 GB
    Free           : 8.8 GB
    Usage %        : 45%

  System Uptime    : 45d 10h 32m 45s

  Network Interfaces:
    Ethernet           : 192.168.1.100
    WiFi               : 10.0.0.50
    VirtualBox         : 192.168.56.1
==================================================
```

---

### 5. `devices`
Lists all connected devices with their status and information.

**Usage:**
```
botify> devices
```

**Output:**
```
📱 CONNECTED DEVICES
==================================================
  Total Devices    : 5

  [1] 🟢 DEVICE_001
      Status       : online
      Ping (Avg)   : 42ms
      Messages     : 156
      Last Seen    : 19/02/2026, 14:29:30
      Registered   : 15/02/2026, 10:15:00

  [2] 🟢 DEVICE_002
      Status       : online
      Ping (Avg)   : 38ms
      Messages     : 89
      Last Seen    : 19/02/2026, 14:29:45
      Registered   : 16/02/2026, 11:20:00

  [3] 🔴 DEVICE_003
      Status       : offline
      Ping (Avg)   : 0ms
      Messages     : 0
      Last Seen    : 19/02/2026, 10:15:30
      Registered   : 18/02/2026, 09:00:00

==================================================
```

---

### 6. `logs [count]`
Shows recent logs. Default is 10, max 50.

**Usage:**
```
botify> logs          # Last 10 logs
botify> logs 20       # Last 20 logs
botify> logs 5        # Last 5 logs
```

**Output:**
```
📋 RECENT LOGS (Last 5)
==================================================
  ✅ [SUCCESS] SERVER
     Server is running on http://192.168.1.100:3000 (206ms)
  ✅ [SUCCESS] SERVER
     Machine IP Address: 192.168.1.100 (207ms)
  ℹ️ [INFO] TELEGRAM
     Testing Telegram connection (195ms)
  🔍 [DEBUG] STARTUP
     MQTT Broker initialized (180ms)
  ✅ [SUCCESS] STARTUP
     Starting MQTT Broker... (177ms)
==================================================
```

---

### 7. `memory`
Shows memory usage details and health status.

**Usage:**
```
botify> memory
```

**Output:**
```
💾 MEMORY USAGE DETAILS
==================================================
  Used             : 52.3 MB
  Percentage       : 45%
  Total System     : 16 GB
  Health Status    : good ✅
  Recommendation   : No action required
==================================================
```

---

### 8. `metrics`
Shows system and performance metrics.

**Usage:**
```
botify> metrics
```

**Output:**
```
📊 SYSTEM METRICS
==================================================
  Server Metrics:
    Uptime         : 2m 45s
    Commands       : 8

  Device Metrics:
    Total          : 5
    Online         : 4
    Offline        : 1
    Messages       : 342
    Avg Ping       : 41ms

  Performance:
    Mem Usage      : 45%
    Mem Used       : 52.3 MB
==================================================
```

---

### 9. `clear`
Clears the console screen.

**Usage:**
```
botify> clear
```

**Effect:** Console is cleared and banner is shown again.

---

### 10. `exit`
Stops the server and exits the application.

**Usage:**
```
botify> exit
```

**Output:**
```
👋 Goodbye! Stopping server...

[Process exits]
```

---

## 🎯 Use Cases

### Monitor Device Connections
```bash
botify> devices
```
See all connected/disconnected devices and their ping times.

### Check System Resources
```bash
botify> status
```
See complete system information including CPU, memory, and network details.

### Troubleshoot Network Issues
```bash
botify> sysinfo
```
Check machine name, IP addresses, and network interfaces.

### View Recent Activity
```bash
botify> logs 20
```
Check the last 20 log entries without restarting.

### Monitor Performance
```bash
botify> memory
botify> metrics
```
Track memory usage and performance metrics.

---

## ⌨️ Features

### Command History
- Access previous commands with **UP/DOWN arrows**
- Edit commands with **LEFT/RIGHT arrows**
- Command history persists during session

### Autocomplete
- Tab completion available for common commands
- Quick access to frequently used commands

### Auto-formatting
- Output automatically formatted with emojis and tables
- Color-coded status indicators
- Readable timestamps and durations

### Real-time Updates
- All data fetched live from running server
- No cache delays
- Accurate metrics

---

## 🔒 Safety Features

### Production-Safe
- Won't show sensitive debug logs in production
- Can be used safely in production environments
- Graceful error handling

### No Breaking Changes
- CLI operates independently from server operations
- Server continues functioning normally during CLI commands
- No performance impact on server operations

### Command Validation
- Invalid commands show error with hint
- Unknown commands ignored gracefully
- Help always available

---

## 📊 Information Provided

### System Information
- ✅ Machine hostname
- ✅ Operating System (type, version, architecture)
- ✅ CPU (model, number of cores)
- ✅ Memory (total, used, free, percentage)
- ✅ Network interfaces and IP addresses
- ✅ System uptime and timezone

### Server Information
- ✅ Server uptime
- ✅ Server base URL and ports
- ✅ Environment (development/production)
- ✅ Commands executed count

### Device Information
- ✅ Connected devices count
- ✅ Device status (online/offline)
- ✅ Average ping time per device
- ✅ Total messages count per device
- ✅ Last seen timestamp
- ✅ Registration timestamp

### Performance Information
- ✅ Memory usage (absolute and percentage)
- ✅ Memory health status
- ✅ System metrics summary
- ✅ Recent logs with timestamps

---

## 🎓 Examples

### Daily Operations

**Morning Check:**
```bash
botify> status    # Check everything at once
botify> devices   # Verify all devices connected
botify> metrics   # Check performance baseline
```

**During Operations:**
```bash
botify> logs 10       # Check recent activity
botify> memory        # Monitor memory health
botify> devices       # Quick device status check
```

**Troubleshooting:**
```bash
botify> sysinfo       # Gather system details
botify> logs 20       # Review detailed logs
botify> status        # Full diagnostic info
```

---

## 🚨 Troubleshooting

### CLI Won't Start
- Make sure server starts successfully first
- Check for port conflicts (API port, MQTT port)
- Verify Node.js version compatibility

### Commands Not Working
- Type `help` to see all available commands
- Check command spelling (lowercase)
- Some commands need arguments (e.g., `logs 5`)

### No Devices Showing
- Ensure MQTT broker is running
- Verify devices are properly registered
- Check network connectivity

### Memory Issues
- Use `memory` command to check health
- Monitor with regular `metrics` checks
- Set up alerts if needed

---

## 🔧 Advanced Usage

### Monitor Specific Device
```bash
botify> devices  # Get device ID
# Find the device and note its status/ping
```

### Export Logs (via CLI)
```bash
botify> logs 50  # Get detailed logs
# Copy and paste logs for analysis
```

### Performance Baseline
```bash
botify> metrics  # Note baseline metrics
# Compare over time to identify trends
```

---

## 📋 Command Reference Card

```
HELP              : help
STATUS            : status
UPTIME            : uptime
SYSTEM INFO       : sysinfo
DEVICE LIST       : devices
RECENT LOGS       : logs [count]
MEMORY USAGE      : memory
METRICS           : metrics
CLEAR SCREEN      : clear
EXIT              : exit
```

---

## ✨ Summary

The **Botify CLI Console** provides:
- ✅ Real-time server monitoring
- ✅ System information display
- ✅ Device management
- ✅ Log viewing
- ✅ Performance metrics
- ✅ No restart required
- ✅ Production-safe operation

All this while the server runs normally in the background!

---

*Documentation Date: February 19, 2026*  
*CLI Version: 1.0.0*  
*Status: ✅ Production Ready*
