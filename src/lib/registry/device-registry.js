import getAllDevices from '../../functions/get-all-device.js';

/**
 * Device Registry
 * Provides a unified interface for accessing device information
 * Can source from either in-memory cache or database
 */
class DeviceRegistry {
    constructor(useCache = true) {
        this.useCache = useCache;
        this.deviceCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheExpiry = 5000; // 5 seconds
    }

    /**
     * Register a device in the cache
     */
    registerDevice(deviceId, deviceData = {}) {
        this.deviceCache.set(deviceId, {
            id: deviceId,
            status: 'online',
            connectedAt: new Date(),
            lastSeen: new Date(),
            messageCount: 0,
            avgPing: 0,
            ...deviceData
        });
        this.lastCacheUpdate = Date.now();
    }

    /**
     * Update device status
     */
    updateDeviceStatus(deviceId, status) {
        const device = this.deviceCache.get(deviceId);
        if (device) {
            device.status = status;
            device.lastSeen = new Date();
            this.lastCacheUpdate = Date.now();
        }
    }

    /**
     * Record device message
     */
    recordMessage(deviceId, messageCount = 1) {
        const device = this.deviceCache.get(deviceId);
        if (device) {
            device.messageCount = (device.messageCount || 0) + messageCount;
            device.lastSeen = new Date();
        }
    }

    /**
     * Get all devices
     * Returns cached devices for fast access, or queries database
     */
    async getAllDevices() {
        if (this.useCache && this.isCacheValid()) {
            return Array.from(this.deviceCache.values());
        }

        try {
            // Try to fetch from database
            const dbDevices = await getAllDevices();
            this.updateCacheFromDatabase(dbDevices);
            return dbDevices;
        } catch (err) {
            // Fallback to cache even if expired
            if (this.deviceCache.size > 0) {
                return Array.from(this.deviceCache.values());
            }
            throw new Error(`Failed to fetch devices: ${err.message}`);
        }
    }

    /**
     * Get all devices synchronously (in-memory only)
     */
    getAllDevicesSync() {
        return Array.from(this.deviceCache.values());
    }

    /**
     * Get device by ID
     */
    getDevice(deviceId) {
        return this.deviceCache.get(deviceId);
    }

    /**
     * Check if cache is valid
     */
    isCacheValid() {
        return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
    }

    /**
     * Update cache from database
     */
    updateCacheFromDatabase(dbDevices) {
        // Clear outdated entries but keep metadata
        for (const dbDevice of dbDevices) {
            const existing = this.deviceCache.get(dbDevice.id);
            this.deviceCache.set(dbDevice.id, {
                ...dbDevice,
                messageCount: existing?.messageCount || 0,
                connectedAt: existing?.connectedAt || new Date(),
                lastSeen: existing?.lastSeen || new Date(),
            });
        }
        this.lastCacheUpdate = Date.now();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.deviceCache.clear();
        this.lastCacheUpdate = 0;
    }
}

export default DeviceRegistry;
