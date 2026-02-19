# PROJECT STRUCTURE - QUICK REFERENCE

```
botify-dashboard/
│
├── 📄 package.json                           ← Dependencies
├── 📄 tailwind.config.js
├── 📄 .env                                   ← Environment variables (not in git)
│
├── 📁 public/                                ← Static files (CSS, JS, Images)
│
├── 📁 src/
│   │
│   ├── 📁 lib/  ⭐ LIBRARY FOLDER (NEW)
│   │   ├── 📁 logger/
│   │   │   └── 📄 logger.js                  ← Centralized logger
│   │   ├── 📁 db/
│   │   │   └── 📄 connection.js              ← MySQL connection pool
│   │   └── 📁 telegram/
│   │       ├── 📄 telegram-client.js         ← Main Telegram service (CONSOLIDATED)
│   │       └── 📄 test-connection.js         ← Telegram API test
│   │
│   ├── 📁 utils/                             ← Helper utilities (deprecated)
│   │   ├── 📄 pretty-console-config.js       ⚠️ Use lib/logger instead
│   │   ├── 📄 db-config.js                   ⚠️ Use lib/db/connection instead
│   │   └── 📄 helpers.js                     ← For future utility functions
│   │
│   ├── 📁 services/                          ← Service layer (backward compat)
│   │   ├── 📄 send-offline-notification-to-telegram.js    ⚠️ Wrapper
│   │   ├── 📄 send-online-notification-to-telegram.js     ⚠️ Wrapper
│   │   ├── 📄 send-relay-notification-to-telegram.js      ⚠️ Wrapper
│   │   └── 📄 testing-telegram-connection.js              ⚠️ Wrapper
│   │
│   ├── 📁 functions/                         ← Business logic
│   │   ├── 📄 authenticate-devices.js        ← MQTT device authentication
│   │   ├── 📄 get-all-device.js              ← Fetch all devices
│   │   ├── 📄 get-device-info.js             ← Get device details
│   │   ├── 📄 get-log-value-device.js        ← Get device logs
│   │   ├── 📄 get-log-value-device-by-range.js
│   │   ├── 📄 register-new-device.js         ← Device registration
│   │   ├── 📄 save-value-to-database.js      ← Save sensor values
│   │   └── 📄 update-status-device.js        ← Update device status
│   │
│   ├── 📁 routes/                            ← API routes
│   │   └── 📄 deviceRoutes.js                ← Device endpoints
│   │
│   ├── 📁 views/                             ← EJS templates
│   │   ├── 📄 devices.ejs                    ← Device list page
│   │   ├── 📄 device.ejs                     ← Device detail page
│   │   ├── 📄 device-logs.ejs                ← Device logs page
│   │   └── 📁 partials/
│   │       └── 📄 header.ejs                 ← Header component
│   │
│   ├── 📄 server.js                          ← Main Express server
│   └── 📄 broker.js                          ← MQTT Broker (Aedes)
│
├── 📁 config/                                ← Configuration files
│
├── 📄 REFACTORING_NOTES.md                   ← This refactoring documentation
├── 📄 README.md
├── 📄 INSTALLATION.md
└── 📄 package-lock.json

```

---

## 📂 FOLDER BREAKDOWN

### **`lib/` - Library & Core Dependencies** ⭐ NEW

This folder contains core libraries and configurations that are imported by other parts of the application.

**Why separate?**
- Distinguishes between core utilities (lib) and business logic (functions)
- Easier to identify reusable components
- Industry standard structure

**Subfolders:**
- `logger/` - Logging configuration
- `db/` - Database connections
- `telegram/` - Telegram API client

---

### **`utils/` - Helpers (Deprecated)**

These files are kept for backward compatibility. Consider using lib instead.

**Recommendation:** 
- Add `helpers.js` here for common utility functions (math, string helpers, etc.)
- Keep database/logger imports redirected to `lib/`

---

### **`services/` - Service Layer (Backward Compatibility)**

Wrapper files that re-export from `lib/telegram/`. This allows old code to keep working.

**How it works:**
```javascript
// OLD: src/services/send-offline-notification-to-telegram.js
import { sendOfflineNotification } from "../lib/telegram/telegram-client.js";
export default sendOfflineNotification;

// Still works:
import notify from './services/send-offline-notification-to-telegram.js';
await notify(deviceId);
```

---

### **`functions/` - Business Logic**

Pure business logic functions that handle device operations, database queries, etc.

**Characteristics:**
- ✓ Depends on lib/ (logger, db)
- ✓ No duplication
- ✓ Focused on specific tasks
- ✓ Imported by routes and broker

---

### **`routes/` - API Routes**

Express route handlers for HTTP endpoints.

**Pattern:**
```
GET  /device          → List all devices
GET  /device/:id      → Get device details
GET  /device/:id/logs → Get device logs
GET  /device/:id/logs-range → Get logs in date range
```

---

### **`views/` - EJS Templates**

HTML templates rendered by Express.

**Pattern:**
- `devices.ejs` - Device list
- `device.ejs` - Single device view
- `device-logs.ejs` - Device logs
- `partials/header.ejs` - Reusable header

---

## 🔄 IMPORT LEVELS (Dependency Flow)

```
views/ ← express renders
   ↓
routes/ ← handles HTTP requests
   ↓
functions/ + lib/ ← business logic
   ↓
lib/ ← core utilities
```

**Never import upward!** Keep it unidirectional.

---

## 🚀 QUICK MIGRATION CHECKLIST

If removing deprecated files:

- [ ] Change `import logger from "../utils/pretty-console-config.js"` 
      to `import logger from "../lib/logger/logger.js"` (already done ✓)

- [ ] Change `import { pool } from "../utils/db-config.js"`
      to `import { pool } from "../lib/db/connection.js"` (already done ✓)

- [ ] Change `import notify from "./services/send-offline-notification-to-telegram.js"`
      to `import { sendOfflineNotification } from "./lib/telegram/telegram-client.js"`

- [ ] Delete deprecated files:
  - `src/utils/pretty-console-config.js`
  - `src/utils/db-config.js`
  - `src/services/send-*.js` (all 4 files)

---

## 💡 BEST PRACTICES FOR THIS STRUCTURE

1. **Never import from views/** - Views are for rendering only
2. **Keep lib/ pure** - No external dependencies beyond npm packages
3. **Use functions/ for business logic** - Not in routes or lib
4. **Organize by feature** - Consider splitting functions/ into subfolders later

Example (Future Enhancement):
```
functions/
├── device/
│   ├── get-all.js
│   ├── get-one.js
│   ├── register.js
│   └── update-status.js
├── auth/
│   └── authenticate-devices.js
└── logs/
    ├── save-value.js
    ├── get-logs.js
    └── get-logs-range.js
```

---

**Last Updated:** February 19, 2026
