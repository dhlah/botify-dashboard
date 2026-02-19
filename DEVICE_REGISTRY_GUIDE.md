# Device Registry Integration Guide

## Overview

The CLI Console requires access to a device registry to display connected devices. There are two approaches:

### Option 1: Using the Logger's Device Monitor (Current)

The CLI currently receives `deviceMonitor` from the logger system. This requires:

1. **Broker Integration**: The MQTT broker must call `deviceMonitor.registerDevice()` when devices connect
2. **Implementation Location**: `src/broker.js` would need to be updated to:
   ```javascript
   import { deviceMonitor } from './lib/logger/index.js';
   
   // In device connect handler:
   deviceMonitor.registerDevice(clientId, clientId);
   deviceMonitor.updateDeviceStatus(clientId, 'online');
   ```

**Status**: ⚠️ Currently NOT integrated - devices won't show in CLI until broker notifies monitor

---

### Option 2: Using the Database Device Registry (Recommended for Production)

Use a dedicated `DeviceRegistry` class that can cache devices while falling back to the database:

```javascript
// In server.js:
import DeviceRegistry from './lib/registry/device-registry.js';

const deviceRegistry = new DeviceRegistry(useCache = true);

const cliHandler = new CLIHandler(logger, deviceRegistry, systemMonitor);
```

**Features**:
- ✅ Uses real database devices
- ✅ Fast in-memory cache (5s TTL)
- ✅ Fallback to database on cache miss
- ✅ Async-compatible with proper error handling

---

### Option 3: Using Database Directly with Sync Adapter

If you only need database devices and don't need caching:

```javascript
// Create a sync adapter wrapper
const databaseDeviceAdapter = {
    getAllDevices: () => {
        // Note: This would need async handling in CLI
        // Not recommended for current sync CLI implementation
    }
};
```

**Status**: ⚠️ Incompatible with current async/sync mismatch

---

## Guard Pattern Implementation

All CLI device accesses are now guarded:

```javascript
// In cli-commands.js
try {
    if (this.deviceMonitor && typeof this.deviceMonitor.getAllDevices === 'function') {
        devices = this.deviceMonitor.getAllDevices();
    } else {
        return '❌ Device monitor unavailable or missing getAllDevices() method.\n';
    }
} catch (err) {
    return `❌ Error fetching devices: ${err.message}\n`;
}
```

This ensures:
- ✅ Clear error messages if misconfigured
- ✅ No crashes from missing methods
- ✅ Graceful degradation

---

## Current Best Practice

Until broker.js integration is added, the CLI safely shows "No devices connected" rather than crashing.

**To enable device display**, choose one of:

1. **Update broker.js** to call `deviceMonitor.registerDevice()` (recommended - minimal change)
2. **Switch to DeviceRegistry** in server.js (more robust)

---

## Integration Checklist

- [ ] Guards added to CLI commands ✅
- [ ] Error handling for missing methods ✅
- [ ] Restart command implemented ✅
- [ ] Device registry module created ✅
- [ ] **TODO**: Wire broker.js to deviceMonitor OR switch to DeviceRegistry in server.js
