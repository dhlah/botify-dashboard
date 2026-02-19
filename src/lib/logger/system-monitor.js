import logger from './logger.js';
import os from 'os';

/**
 * System Performance Monitor
 * Track memory, CPU, dan performance metrics
 */
class SystemMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            uptime: 0,
            memoryUsage: {},
            cpuUsage: 0,
            loadAverage: [],
            systemInfo: {}
        };
    }

    /**
     * Get memory usage
     */
    getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            rss: this.formatBytes(usage.rss),
            heapTotal: this.formatBytes(usage.heapTotal),
            heapUsed: this.formatBytes(usage.heapUsed),
            external: this.formatBytes(usage.external),
            heapUsedPercent: Math.round((usage.heapUsed / usage.heapTotal) * 100)
        };
    }

    /**
     * Format bytes to readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get uptime in different formats
     */
    getUptime() {
        const ms = Date.now() - this.startTime;
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        let uptimeStr = '';
        if (days > 0) uptimeStr += `${days}d `;
        if (hours > 0) uptimeStr += `${hours}h `;
        if (minutes > 0) uptimeStr += `${minutes}m `;
        uptimeStr += `${seconds}s`;

        return {
            ms,
            formatted: uptimeStr.trim()
        };
    }

    /**
     * Get system information
     */
    getSystemInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            cpuCount: os.cpus().length,
            totalMemory: this.formatBytes(os.totalmem()),
            freeMemory: this.formatBytes(os.freemem()),
            hostname: os.hostname()
        };
    }

    /**
     * Print system monitoring
     */
    printSystemMonitoring() {
        console.log('');
        console.log('💻 SYSTEM MONITORING');
        console.log('─'.repeat(60));

        // Uptime
        const uptime = this.getUptime();
        console.log(`  ⏱ Uptime              : ${uptime.formatted}`);

        // Memory
        const memory = this.getMemoryUsage();
        console.log(`  💾 Memory Usage        : ${memory.heapUsed} / ${memory.heapTotal} (${memory.heapUsedPercent}%)`);
        console.log(`  📦 RSS Memory          : ${memory.rss}`);

        // System Info
        const sysInfo = this.getSystemInfo();
        console.log(`  🖥 System              : ${sysInfo.platform} (${sysInfo.arch})`);
        console.log(`  🔧 CPU Cores           : ${sysInfo.cpuCount}`);
        console.log(`  💿 Total Memory        : ${sysInfo.totalMemory}`);
        console.log(`  ⚡ Free Memory         : ${sysInfo.freeMemory}`);
        console.log(`  🏠 Hostname            : ${sysInfo.hostname}`);

        console.log('─'.repeat(60));
    }

    /**
     * Check memory health
     */
    checkMemoryHealth() {
        const memory = this.getMemoryUsage();
        const heapPercent = memory.heapUsedPercent;

        if (heapPercent > 90) {
            logger.warn(`Memory usage critical: ${heapPercent}%`, "SYSTEM-MONITOR");
            return 'CRITICAL';
        } else if (heapPercent > 75) {
            logger.warn(`Memory usage high: ${heapPercent}%`, "SYSTEM-MONITOR");
            return 'WARNING';
        } else {
            logger.debug(`Memory usage normal: ${heapPercent}%`, "SYSTEM-MONITOR");
            return 'HEALTHY';
        }
    }

    /**
     * Get health report
     */
    getHealthReport() {
        const memory = this.getMemoryUsage();
        const uptime = this.getUptime();
        const sysInfo = this.getSystemInfo();

        return {
            timestamp: new Date().toLocaleString('id-ID'),
            uptime: uptime.formatted,
            memory: memory,
            systemInfo: sysInfo,
            memoryHealth: this.checkMemoryHealth()
        };
    }
}

// Create singleton instance
const systemMonitor = new SystemMonitor();

export default systemMonitor;
