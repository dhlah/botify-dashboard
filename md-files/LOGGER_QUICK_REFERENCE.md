# Logger Quick Start

## 📚 Import Logger

```javascript
// Default logger
import logger from './lib/logger/logger.js';

// All monitoring tools
import {
    logger,
    logAggregator,
    deviceMonitor,
    systemMonitor,
    initializeMonitoring,
    printFullReport
} from './lib/logger/index.js';
```

---

## � Environment-Based Logging

**Production Mode** - Debug logs HIDDEN:
```env
NODE_ENV=production
```

**Development Mode** - All logs VISIBLE (default):
```env
NODE_ENV=development
```

**Custom Override**:
```env
BOTIFY_LOG_LEVEL=debug    # Force show debug in production
BOTIFY_LOG_LEVEL=warn     # Only warnings & errors
```

See [ENV_LOGGING_GUIDE.md](ENV_LOGGING_GUIDE.md) for details.

---

## 🎯 Quick Examples

### Print Banner
```javascript
logger.printBanner();
```

### Basic Logging
```javascript
logger.info("Message", "SECTION");      // 🔵 Info
logger.success("Message", "SECTION");   // 🟢 Success
logger.warn("Message", "SECTION");      // 🟡 Warning
logger.error("Message", "SECTION");     // 🔴 Error
logger.debug("Message", "SECTION");     // 🟣 Debug (hidden in production)
```

### Print Monitoring
```javascript
logger.printSystemInfo({ /* config */ });
logger.printMonitoringMetrics();
logger.printDeviceMonitoring();
logger.printLoggingConfig();            // ← NEW! Show environment settings
logger.printSection("Title", [/* content */]);
logger.printLogReport();
```

### Check Environment
```javascript
if (logger.isProduction()) {
    // In production mode
}

if (logger.isDebugEnabled()) {
    // Debug logs are visible
}

const envInfo = logger.getEnvironmentInfo();
console.log(envInfo);
// { environment, logLevel, isProduction, isDebugEnabled, debugVisible }
```

### Change Log Level
```javascript
logger.setLogLevel('debug');   // Enable all logs
logger.setLogLevel('info');    // Hide debug logs
logger.setLogLevel('warn');    // Show only warn/error
```

### Device Monitoring
```javascript
deviceMonitor.registerDevice(id, name, chatId);
deviceMonitor.updateDeviceStatus(id, status, pingMs);
deviceMonitor.recordMessage(id, value, topic);
deviceMonitor.printDeviceMonitoring();
deviceMonitor.getMetrics();
```

### System Monitoring
```javascript
systemMonitor.getMemoryUsage();
systemMonitor.getUptime();
systemMonitor.getSystemInfo();
systemMonitor.printSystemMonitoring();
systemMonitor.getHealthReport();
```

### Log Aggregation
```javascript
logAggregator.getLogsByLevel('error');
logAggregator.getLogsBySection('MQTT');
logAggregator.getLatestLogs(10);
logAggregator.getErrorReport();
logAggregator.printLogReport();
logAggregator.export();
```

---

## 📋 Built-in Sections

```
STARTUP           - Server startup
SERVER            - Server status
MQTT              - MQTT Broker
MQTT-DEVICE       - Device connections
MQTT-PUBLISH      - Message publishing
SOCKET.IO         - Socket events
TELEGRAM          - Telegram notifications
DEVICE-MONITOR    - Device tracking
SYSTEM-MONITOR    - System metrics
LOGS              - Log reports
```

---

## 🎨 Output Examples

```
[19/2/2026, 07.01.23] [STARTUP] Starting... 206ms
[19/2/2026, 07.01.23] [SERVER] ✓ Running 250ms
[19/2/2026, 07.01.23] [ERROR] ✗ Connection failed 251ms
```

---

## ⚙️ Environment Settings

Automatic display on startup:
```
⚙️ LOGGING CONFIGURATION
────────────────────────────────────────
  Environment          : PRODUCTION
  Log Level            : INFO
  Debug Enabled        : NO ✗
  Production Mode      : YES
  Console Debug Logs   : HIDDEN
────────────────────────────────────────
```

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🎨 **Colors** | Colored output by level |
| ⚡ **ASCII Art** | Botify Service banner |
| 📊 **Metrics** | Real-time monitoring |
| 🔌 **Device Tracking** | Device status monitoring |
| 💻 **System Info** | Memory, uptime, CPU |
| 📝 **Log Aggregation** | Collect & analyze logs |
| ⏱️ **Uptime** | Auto-tracked milliseconds |
| 🌍 **Environment-Aware** | Auto-hide debug in production |

---

## 🔐 Production Safety

✅ Debug logs automatically hidden in production  
✅ Still collected in log aggregator (accessible via API)  
✅ Reduce console noise  
✅ Better performance  
✅ Can be re-enabled temporarily for debugging

---

**Status:** ✅ Ready to Use

