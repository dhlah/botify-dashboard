import logger from './logger.js';

/**
 * Device Monitoring Tracker
 * Track semua connected devices dan status mereka
 */
class DeviceMonitor {
    constructor() {
        this.devices = new Map();
        this.metrics = {
            totalConnections: 0,
            totalDisconnections: 0,
            onlineDevices: 0,
            offlineDevices: 0,
            averagePingMs: 0,
            lastUpdate: new Date()
        };
    }

    /**
     * Register device connection
     */
    registerDevice(deviceId, deviceName, chatId = null) {
        this.devices.set(deviceId, {
            id: deviceId,
            name: deviceName,
            chatId,
            status: 'unknown',
            connectedAt: new Date(),
            lastPing: new Date(),
            totalMessages: 0,
            lastValue: null,
            pingHistory: []
        });
        
        logger.success(`Device registered: ${deviceName}`, "DEVICE-MONITOR");
    }

    /**
     * Update device status
     */
    updateDeviceStatus(deviceId, status, pingMs = 0) {
        const device = this.devices.get(deviceId);
        if (!device) {
            logger.warn(`Device ${deviceId} not found in tracker`, "DEVICE-MONITOR");
            return;
        }

        const oldStatus = device.status;
        device.status = status;
        device.lastPing = new Date();
        device.pingHistory.push(pingMs);
        
        // Keep last 100 pings
        if (device.pingHistory.length > 100) {
            device.pingHistory.shift();
        }

        // Update metrics
        if (oldStatus !== status) {
            if (status === 'online') {
                this.metrics.onlineDevices++;
                this.metrics.offlineDevices--;
                this.metrics.totalConnections++;
            } else if (status === 'offline') {
                this.metrics.offlineDevices++;
                this.metrics.onlineDevices--;
                this.metrics.totalDisconnections++;
            }
        }

        this.metrics.lastUpdate = new Date();
        this.calculateAveragePing();
    }

    /**
     * Record message from device
     */
    recordMessage(deviceId, value, topic) {
        const device = this.devices.get(deviceId);
        if (!device) return;

        device.totalMessages++;
        device.lastValue = {
            value,
            topic,
            timestamp: new Date()
        };
    }

    /**
     * Calculate average ping
     */
    calculateAveragePing() {
        let totalPing = 0;
        let totalReadings = 0;

        for (const device of this.devices.values()) {
            totalPing += device.pingHistory.reduce((a, b) => a + b, 0);
            totalReadings += device.pingHistory.length;
        }

        this.metrics.averagePingMs = totalReadings > 0 
            ? Math.round(totalPing / totalReadings) 
            : 0;
    }

    /**
     * Get all devices as array
     */
    getAllDevices() {
        return Array.from(this.devices.values()).map(device => ({
            ...device,
            connectedAt: device.connectedAt.toLocaleString('id-ID'),
            lastPing: device.lastPing.toLocaleString('id-ID'),
            avgPingMs: device.pingHistory.length > 0 
                ? Math.round(device.pingHistory.reduce((a, b) => a + b, 0) / device.pingHistory.length)
                : 0
        }));
    }

    /**
     * Get device by ID
     */
    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }

    /**
     * Print device monitoring table
     */
    printDeviceMonitoring() {
        const devices = this.getAllDevices();
        logger.printDeviceMonitoring(devices);
    }

    /**
     * Print metrics
     */
    printMetrics() {
        console.log('');
        console.log('📊 SYSTEM METRICS');
        console.log('─'.repeat(60));
        
        const metrics = [
            ['Online Devices', this.metrics.onlineDevices, '🟢'],
            ['Offline Devices', this.metrics.offlineDevices, '🔴'],
            ['Total Connections', this.metrics.totalConnections, '↑'],
            ['Total Disconnections', this.metrics.totalDisconnections, '↓'],
            ['Average Ping', `${this.metrics.averagePingMs}ms`, '⏱'],
            ['Last Update', this.metrics.lastUpdate.toLocaleString('id-ID'), '🕐']
        ];

        metrics.forEach(([label, value, emoji]) => {
            console.log(`  ${emoji} ${label.padEnd(25)} : ${value}`);
        });
        
        console.log('─'.repeat(60));
    }

    /**
     * Get metrics object
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.devices.clear();
        this.metrics = {
            totalConnections: 0,
            totalDisconnections: 0,
            onlineDevices: 0,
            offlineDevices: 0,
            averagePingMs: 0,
            lastUpdate: new Date()
        };
    }
}

// Create singleton instance
const deviceMonitor = new DeviceMonitor();

export default deviceMonitor;
