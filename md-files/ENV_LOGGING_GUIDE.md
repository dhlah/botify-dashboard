# Environment-Based Logging

## Overview

Botify Logger mendukung **environment-aware logging** yang secara otomatis menyesuaikan verbosity (tingkat detail) berdasarkan environment.

**Fitur Utama:**
- ✅ Production: Debug logs **otomatis disembunyikan**
- ✅ Development: Semua logs ditampilkan
- ✅ Custom override via `BOTIFY_LOG_LEVEL`
- ✅ Logs tetap dikumpulkan (hanya console yang disembunyikan)

---

## Environment Modes

### 1. Production Mode
```
NODE_ENV=production
```

**Behavior:**
- ✗ Debug logs **HIDDEN** dari console
- ✓ Info logs ditampilkan
- ✓ Warning logs ditampilkan
- ✓ Error logs ditampilkan
- ✓ Success logs ditampilkan

**Output:**
```
[timestamp] [STARTUP] Starting MQTT Broker... 206ms       ← Visible
[timestamp] [DEBUG] Something value is 42 213ms           ← HIDDEN
[timestamp] [ERROR] Connection failed 245ms               ← Visible
```

**Günü:**
- Mengurangi console noise
- Tetap aman untuk debugging (logs dikumpulkan di log aggregator)
- Dapat di-override saat diperlukan

---

### 2. Development Mode (Default)
```
NODE_ENV=development
```

**Behavior:**
- ✓ Debug logs ditampilkan
- ✓ Info logs ditampilkan
- ✓ Warning logs ditampilkan
- ✓ Error logs ditampilkan
- ✓ Success logs ditampilkan

**Output:**
```
[timestamp] [STARTUP] Starting MQTT Broker... 206ms
[timestamp] [DEBUG] Something value is 42 213ms           ← Visible
[timestamp] [ERROR] Connection failed 245ms
```

---

### 3. Custom Log Level
Gunakan `BOTIFY_LOG_LEVEL` untuk override default:

```
# Increase verbosity in production for troubleshooting
NODE_ENV=production
BOTIFY_LOG_LEVEL=debug            ← Semua logs visible

# Reduce noise in development
NODE_ENV=development
BOTIFY_LOG_LEVEL=warn             ← Hanya warn & error
```

---

## Log Level Hierarchy

```
Error (0)
  ↓
Warning (1)
  ↓
Info/Success (2)
  ↓
Debug (3)
```

Semakin rendah angka, semakin restrictive. Contoh:
- **Level: error** - Hanya error logs
- **Level: warn** - Error + warning logs
- **Level: info** - Error + warning + info/success logs
- **Level: debug** - Semua logs

---

## Configuration Examples

### Example 1: Production with Standard Logging
```env
NODE_ENV=production
# Auto: BOTIFY_LOG_LEVEL=info
```

**Output:**
```
✓ Info logs shown
✓ Warning logs shown
✓ Error logs shown
✗ Debug logs HIDDEN
```

---

### Example 2: Development with All Details
```env
NODE_ENV=development
# Auto: BOTIFY_LOG_LEVEL=debug
```

**Output:**
```
✓ All logs shown
✓ Debug logs shown
✓ Info logs shown
✓ Warning logs shown
✓ Error logs shown
```

---

### Example 3: Production with Debug Enabled
```env
NODE_ENV=production
BOTIFY_LOG_LEVEL=debug
```

**Use Case:** Remote debugging dalam production
**Output:**
```
✓ All logs shown (temporary for troubleshooting)
```

---

### Example 4: Development with Limited Logging
```env
NODE_ENV=development
BOTIFY_LOG_LEVEL=warn
```

**Use Case:** Reduce noise saat fokus ke warning/error
**Output:**
```
✓ Warning logs shown
✓ Error logs shown
✗ Debug logs hidden
✗ Info logs hidden
```

---

## Checking Environment Info

### Console Output
Saat startup, logger menampilkan:

```
⚙️ LOGGING CONFIGURATION
────────────────────────────────────────────────────────────
  Environment         : PRODUCTION
  Log Level           : INFO
  Debug Enabled       : NO ✗
  Production Mode     : YES
  Console Debug Logs  : HIDDEN
────────────────────────────────────────────────────────────
```

### Programmatic Access
```javascript
import logger from './lib/logger/logger.js';

// Get environment info
const envInfo = logger.getEnvironmentInfo();
console.log(envInfo);
// Output:
// {
//   environment: 'production',
//   logLevel: 'info',
//   isProduction: true,
//   isDebugEnabled: false,
//   debugVisible: false
// }

// Check if debug is enabled
if (logger.isDebugEnabled()) {
    console.log("Debug logging is enabled");
}

// Check if production
if (logger.isProduction()) {
    console.log("Running in production mode");
}
```

---

## Dynamic Log Level Changes

Anda dapat mengubah log level saat runtime:

```javascript
import logger from './lib/logger/logger.js';

// Change log level
logger.setLogLevel('debug');    // ✓ Success
logger.setLogLevel('info');     // ✓ Success
logger.setLogLevel('warn');     // ✓ Success
logger.setLogLevel('error');    // ✓ Success
logger.setLogLevel('invalid');  // ✗ Returns false

// After change:
logger.debug("Now visible", "DEBUG");  // Jika setLogLevel('debug')
```

---

## Important Notes

### ⚠️ Logs Are Still Collected
Debug logs **tidak ditampilkan** di console dalam production, tetapi tetap:
- ✓ Dikumpulkan dalam log aggregator
- ✓ Tersimpan dalam memory
- ✓ Dapat diakses via `logAggregator.getLogsByLevel('debug')`
- ✓ Dapat di-export via `logAggregator.export()`

**Kenapa?** Logs tetap tersimpan untuk:
- Debugging via logging service
- Historical analysis
- Troubleshooting kapan diperlukan
- Compliance / auditing

### 🔒 Production Best Practices

1. **Set NODE_ENV=production**
   ```env
   NODE_ENV=production
   ```

2. **Debug logs otomatis hidden**
   - Mengurangi console output
   - Lebih cepat execusi
   - Lebih clean logs

3. **Tetap dapat di-debug**
   - Logs tersimpan di log aggregator
   - Dapat di-access programmatically
   - Dapat diaktifkan kembali dengan BOTIFY_LOG_LEVEL=debug

4. **Monitor production**
   - Setup log aggregator export
   - Track errors dengan error report
   - Monitor device status

---

## Environment Variables Reference

| Variable | Default | Example | Description |
|----------|---------|---------|-------------|
| `NODE_ENV` | development | production | Environment type |
| `BOTIFY_LOG_LEVEL` | auto | debug, info, warn, error | Log verbosity level |

### Defaults
- **NODE_ENV=development** → BOTIFY_LOG_LEVEL=debug (semua logs)
- **NODE_ENV=production** → BOTIFY_LOG_LEVEL=info (debug hidden)
- **BOTIFY_LOG_LEVEL set** → Use custom value (override default)

---

## Troubleshooting

### Q: Debug logs masih muncul di production
**A:** Check `.env` file:
```env
NODE_ENV=production
BOTIFY_LOG_LEVEL=debug  # ← Remove ini untuk hide debug logs
```

### Q: Saya tidak bisa melihat debug logs di development
**A:** Check `.env` file:
```env
NODE_ENV=development    # ← Pastikan ini tidak production
BOTIFY_LOG_LEVEL=debug  # ← Optional, biasanya default
```

### Q: Bagaimana cara debug production?
**A:** Temporary set debug level:
```env
NODE_ENV=production
BOTIFY_LOG_LEVEL=debug  # ← Temporary untuk troubleshooting
```

Atau programmatically:
```javascript
logger.setLogLevel('debug');  // Enable debug temporarily
```

---

## Implementation Details

### How It Works

1. **Environment Detection**
   ```javascript
   this.environment = process.env.NODE_ENV || 'development';
   ```

2. **Log Level Determination**
   ```javascript
   if (NODE_ENV === 'production') {
       BOTIFY_LOG_LEVEL = 'info'  // Default
   } else {
       BOTIFY_LOG_LEVEL = 'debug' // Default
   }
   ```

3. **Console Filter**
   ```javascript
   debug(message, section) {
       // Collect log always
       logAggregator.addLog('debug', message, section, timestamp);
       
       // But only show in console if allowed
       if (this.shouldLog('debug')) {
           console.log(...);  // ← Only if level permits
       }
   }
   ```

---

## Examples

### Log Aggregator Still Captures Everything

```javascript
import { logAggregator } from './lib/logger/index.js';

// Even if debug logs hidden from console, they're captured:
const debugLogs = logAggregator.getLogsByLevel('debug');
console.log(`Total debug logs: ${debugLogs.length}`);

// Export all logs including hidden ones:
const allLogs = logAggregator.export();
console.log(allLogs);
```

---

## Quick Setup

### For Production
```env
NODE_ENV=production
# Debug logs automatically hidden
```

### For Development
```env
NODE_ENV=development
# All logs shown
```

### For Debugging in Production
```env
NODE_ENV=production
BOTIFY_LOG_LEVEL=debug
# Enable debug temporarily
```

---

**Status:** ✅ Fully Implemented  
**Created:** February 19, 2026
