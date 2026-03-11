# Database Schema - Botify Dashboard

**Database Type:** MySQL  
**Database Name:** `botify_db` (configurable via `.env`)  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

---

## Database Creation

```sql
CREATE DATABASE IF NOT EXISTS botify_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE botify_db;
```

---

## Tables

### 1. device

Stores information about registered IoT devices.

```sql
CREATE TABLE IF NOT EXISTS device (
  id VARCHAR(50) PRIMARY KEY COMMENT 'Unique device identifier',
  name VARCHAR(255) NOT NULL COMMENT 'Human-readable device name',
  token VARCHAR(255) NOT NULL UNIQUE COMMENT 'MQTT authentication token',
  deviceState VARCHAR(20) DEFAULT 'offline' COMMENT 'Device status: online, offline, error',
  chatId VARCHAR(50) DEFAULT NULL COMMENT 'Telegram chat ID for notifications',
  owner VARCHAR(100) DEFAULT NULL COMMENT 'Device owner/operator identifier',
  lastConnection TIMESTAMP DEFAULT NULL COMMENT 'Last recorded connection time',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Device registration timestamp',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  INDEX idx_device_state (deviceState),
  INDEX idx_last_connection (lastConnection),
  INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='IoT Devices Registry';
```

**Field Descriptions:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | VARCHAR(50) | Device unique ID | device-001, esp32-kitchen |
| name | VARCHAR(255) | Device display name | Living Room Sensor |
| token | VARCHAR(255) | MQTT password/token | abc123xyz789 |
| deviceState | VARCHAR(20) | Current status | online, offline |
| chatId | VARCHAR(50) | Telegram chat ID | 123456789 |
| owner | VARCHAR(100) | Owner identifier | user@example.com |
| lastConnection | TIMESTAMP | Last connection time | 2024-03-09 14:30:45 |
| createdAt | TIMESTAMP | Registration time | 2024-01-15 10:00:00 |
| updatedAt | TIMESTAMP | Last update time | 2024-03-09 15:45:30 |

**Constraints:**
- Primary Key: `id`
- Unique: `token`
- Indexes: `deviceState`, `lastConnection`, `createdAt`

---

### 2. device_values

Stores time-series data from devices (sensor readings, status changes, etc.).

```sql
CREATE TABLE IF NOT EXISTS device_values (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique record ID (UUID)',
  device_id VARCHAR(50) NOT NULL COMMENT 'Reference to device table',
  value LONGTEXT NOT NULL COMMENT 'Device reading or status value',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the value was recorded',
  
  FOREIGN KEY (device_id) REFERENCES device(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_device_timestamp (device_id, timestamp),
  INDEX idx_created_date (DATE(timestamp))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Device sensor readings and data points';
```

**Field Descriptions:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | VARCHAR(36) | UUID of the record | 550e8400-e29b-41d4-a716-446655440000 |
| device_id | VARCHAR(50) | Device reference | device-001 |
| value | LONGTEXT | Sensor reading | 25.5, on, 1024, temperature:25.5 |
| timestamp | TIMESTAMP | Recording time | 2024-03-09 14:30:45 |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `device_id` → `device(id)` (ON DELETE CASCADE)
- Indexes:
  - `device_id` - Fast filtering by device
  - `timestamp` - Time-based queries
  - `device_id, timestamp` - Combined queries
  - `DATE(timestamp)` - Daily aggregations

---

## SQL Queries Reference

### Device Operations

#### Register New Device
```sql
INSERT INTO device (id, name, token, deviceState, chatId, owner)
VALUES ('device-001', 'Living Room', 'token123', 'offline', '123456', 'user@example.com');
```

#### Get All Devices
```sql
SELECT * FROM device ORDER BY createdAt DESC;
```

#### Get Device by ID
```sql
SELECT * FROM device WHERE id = 'device-001';
```

#### Update Device Status
```sql
UPDATE device 
SET deviceState = 'online', lastConnection = NOW() 
WHERE id = 'device-001';
```

#### Get Offline Devices
```sql
SELECT * FROM device 
WHERE deviceState = 'offline' 
ORDER BY lastConnection DESC;
```

### Data Logging Operations

#### Save Device Value
```sql
INSERT INTO device_values (id, device_id, value, timestamp)
VALUES (UUID(), 'device-001', '25.5', NOW());
```

#### Get Latest Value
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
ORDER BY timestamp DESC 
LIMIT 1;
```

#### Get Last N Values
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Time Range Queries

#### Last 10 Minutes
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
ORDER BY timestamp DESC;
```

#### Last Hour
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY timestamp DESC;
```

#### Last 24 Hours
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY timestamp DESC;
```

#### Last 30 Days
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY timestamp DESC;
```

#### Custom Date Range
```sql
SELECT * FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp BETWEEN '2024-03-01 00:00:00' AND '2024-03-09 23:59:59'
ORDER BY timestamp DESC;
```

### Analytics Queries

#### Count Values per Device
```sql
SELECT device_id, COUNT(*) as count 
FROM device_values 
GROUP BY device_id;
```

#### Daily Value Count
```sql
SELECT DATE(timestamp) as date, COUNT(*) as count 
FROM device_values 
WHERE device_id = 'device-001'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

#### Hourly Aggregation
```sql
SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour, 
       AVG(CAST(value AS DECIMAL(10,2))) as avg_value,
       COUNT(*) as count
FROM device_values 
WHERE device_id = 'device-001' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY hour
ORDER BY hour DESC;
```

---

## Indexes

### Explanation

Indexes optimize query performance. The schema includes:

**device table:**
1. `idx_device_state` - Fast filtering by device status
2. `idx_last_connection` - Quick last connection queries
3. `idx_created_at` - Sorting by registration date

**device_values table:**
1. `idx_device_id` - Filter by device
2. `idx_timestamp` - Filter by time range
3. `idx_device_timestamp` - Combined device + time queries (most important)
4. `idx_created_date` - Daily aggregations

### Index Performance Impact

```
Without index: ~200ms for 1M rows
With proper index: ~5ms for 1M rows
```

---

## Data Maintenance

### Archive Old Data
```sql
-- Archive device values older than 1 year
DELETE FROM device_values 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Optimize Table
```sql
-- Optimize table size after deletions
OPTIMIZE TABLE device_values;
OPTIMIZE TABLE device;
```

### Check Table
```sql
-- Verify table integrity
CHECK TABLE device_values;
CHECK TABLE device;
```

### Backup
```bash
# Backup entire database
mysqldump -u root -p botify_db > backup_botify_db.sql

# Backup specific table
mysqldump -u root -p botify_db device_values > backup_device_values.sql
```

### Restore
```bash
# Restore entire database
mysql -u root -p botify_db < backup_botify_db.sql
```

---

## Database Size Estimation

### Storage per Record
- **device table**: ~500 bytes per device
- **device_values table**: ~100 bytes per value record

### Growth Examples

| Scenario | 1 Year Storage (GB) | 5 Years Storage (GB) |
|----------|-------------------|----------------------|
| 10 devices, 1 value/min | ~0.5 GB | ~2.5 GB |
| 100 devices, 1 value/min | ~5 GB | ~25 GB |
| 1000 devices, 1 value/min | ~50 GB | ~250 GB |

---

## Connection Configuration

### Environment Variables (.env)
```env
DB_HOST=localhost          # MySQL host
DB_USER=root               # MySQL user
DB_PASSWORD=admin          # MySQL password
DB_NAME=botify_db          # Database name
DB_PORT=3306               # MySQL port (default)
```

### Connection Pool Settings
```javascript
// from src/lib/db/connection.js
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

---

## Migration Notes

### From Previous Version

If upgrading from a version without timestamps:

```sql
-- Add createdAt and updatedAt if missing
ALTER TABLE device ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE device ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create indexes if missing
CREATE INDEX idx_device_state ON device(deviceState);
CREATE INDEX idx_last_connection ON device(lastConnection);
CREATE INDEX idx_device_timestamp ON device_values(device_id, timestamp);
```

---

## Performance Recommendations

1. **Regular Maintenance**
   - Run `ANALYZE TABLE` monthly
   - Archive data older than 1 year
   - Monitor database size

2. **Query Optimization**
   - Use time range filters in queries
   - Avoid SELECT * on device_values
   - Use LIMIT for pagination

3. **Connection Management**
   - Use connection pooling (already implemented)
   - Set appropriate pool size based on concurrent users
   - Monitor connection usage

4. **Monitoring**
   - Track slow queries
   - Monitor disk usage
   - Alert on connection issues

---

## Troubleshooting

### Table Doesn't Exist Error
```sql
-- Check if tables exist
SHOW TABLES IN botify_db;

-- If not, create them using the schema above
```

### Connection Refused
```bash
# Check MySQL status
sudo service mysql status

# Start if not running
sudo service mysql start

# Verify connection
mysql -h localhost -u root -p
```

### Slow Queries
```sql
-- Check query execution plan
EXPLAIN SELECT * FROM device_values 
WHERE device_id = 'device-001' 
AND timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Should use index efficiently
```

---

**Last Updated:** March 2024  
**Version:** 1.0.0
