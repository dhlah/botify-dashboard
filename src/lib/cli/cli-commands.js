import os from 'os';
import { execSync } from 'child_process';

/**
 * CLI Commands Handler
 * Provides interactive commands for server monitoring
 */
class CLICommands {
    constructor(logger, deviceMonitor, systemMonitor) {
        this.logger = logger;
        this.deviceMonitor = deviceMonitor;
        this.systemMonitor = systemMonitor;
        this.startTime = Date.now();
        this.commandsExecuted = 0;
    }

    /**
     * Get all available commands
     */
    getCommands() {
        return {
            help: 'Show all available commands',
            status: 'Display server status & detailed system info',
            uptime: 'Show server uptime',
            sysinfo: 'Detailed system information',
            devices: 'List all connected devices',
            logs: 'Show recent logs',
            memory: 'Show memory usage details',
            metrics: 'Show system metrics',
            clear: 'Clear console screen',
            restart: 'Restart the server process',
            exit: 'Stop the server',
        };
    }

    /**
     * Get detailed system information
     */
    async getSystemInfo() {
        try {
            const osType = os.type();
            const platform = os.platform();
            const hostname = os.hostname();
            const release = os.release();
            const arch = os.arch();
            const cpus = os.cpus();
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const uptime = os.uptime();
            const networkInterfaces = os.networkInterfaces();

            // Get IP addresses
            const ips = [];
            for (const [interfaceName, addresses] of Object.entries(networkInterfaces)) {
                for (const addr of addresses) {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        ips.push({
                            interface: interfaceName,
                            ip: addr.address,
                        });
                    }
                }
            }

            return {
                machine: hostname,
                os: `${osType} ${release}`,
                platform,
                arch,
                cpus: cpus.length,
                cpuModel: cpus[0]?.model || 'Unknown',
                totalMemory: this.formatBytes(totalMemory),
                freeMemory: this.formatBytes(freeMemory),
                usedMemory: this.formatBytes(totalMemory - freeMemory),
                memoryUsagePercent: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2),
                systemUptime: this.formatUptime(uptime),
                networkIPs: ips,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get server status
     */
    async getServerStatus() {
        const serverUptime = Date.now() - this.startTime;
        let devices = [];
        try {
            if (this.deviceMonitor && typeof this.deviceMonitor.getAllDevices === 'function') {
                const result = this.deviceMonitor.getAllDevices();
                // Handle both sync and async results
                devices = result instanceof Promise ? await result : result;
            } else {
                this.logger.warn('deviceMonitor.getAllDevices() is not available', 'CLI');
            }
        } catch (err) {
            this.logger.warn(`deviceMonitor error: ${err.message}`, 'CLI');
        }
        const memoryUsage = this.systemMonitor.getMemoryUsage();
        const systemMemoryPercent = this.getSystemMemoryPercent();

        return {
            serverUptime: this.formatUptime(serverUptime / 1000),
            commandsExecuted: this.commandsExecuted,
            connectedDevices: devices.length,
            totalMessages: devices.reduce((sum, d) => sum + (d.messageCount || 0), 0),
            avgPing: devices.length > 0
                ? devices.reduce((sum, d) => sum + (d.avgPing || 0), 0) / devices.length
                : 0,
            memoryUsage: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                heapPercent: memoryUsage.heapUsedPercent,
                systemPercent: systemMemoryPercent,
            },
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
     * Get system-wide memory percentage
     */
    getSystemMemoryPercent() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        return Math.round((usedMem / totalMem) * 100);
    }

    /**
     * Format uptime to readable format
     */
    formatUptime(seconds) {
        if (typeof seconds === 'number' && seconds < 1) {
            return 'Just started';
        }

        seconds = Math.floor(typeof seconds === 'number' ? seconds : seconds / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Format timestamp
     */
    formatTimestamp(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /**
     * Handle command execution
     */
    async executeCommand(input) {
        const trimmedInput = input.trim().toLowerCase();
        const [command, ...args] = trimmedInput.split(' ');

        this.commandsExecuted++;

        switch (command) {
            case 'help':
                return this.showHelp();

            case 'status':
                return this.showStatus();

            case 'uptime':
                return this.showUptime();

            case 'sysinfo':
                return this.showSystemInfo();

            case 'devices':
                return this.showDevices();

            case 'logs':
                return this.showLogs(args[0] || '10');

            case 'memory':
                return this.showMemory();

            case 'metrics':
                return this.showMetrics();

            case 'clear':
                console.clear();
                this.showBanner();
                return '';

            case 'exit':
                return 'exit';

            case 'restart':
                return 'restart';

            case '':
                return '';

            default:
                return `❌ Unknown command: "${command}". Type "help" for available commands.`;
        }
    }

    /**
     * Show help
     */
    showHelp() {
        const commands = this.getCommands();
        let output = '\n📋 Available Commands:\n';
        output += '─'.repeat(50) + '\n';

        for (const [cmd, description] of Object.entries(commands)) {
            output += `  ${cmd.padEnd(12)} → ${description}\n`;
        }

        output += '─'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show server status
     */
    async showStatus() {
        const status = await this.getServerStatus();
        const sysInfo = await this.getSystemInfo();

        let output = '\n🔍 SERVER STATUS & SYSTEM INFO\n';
        output += '═'.repeat(50) + '\n';

        // Server Info
        output += '\n📊 SERVER STATUS:\n';
        output += `  Uptime           : ${status.serverUptime}\n`;
        output += `  Commands Exec    : ${status.commandsExecuted}\n`;
        output += `  Connected Dev    : ${status.connectedDevices}\n`;
        output += `  Total Messages   : ${status.totalMessages}\n`;
        output += `  Avg Device Ping  : ${status.avgPing.toFixed(0)}ms\n`;

        // Memory Status
        output += '\n💾 MEMORY:\n';
        output += `  Heap Used        : ${status.memoryUsage.heapUsed}\n`;
        output += `  Heap Total       : ${status.memoryUsage.heapTotal}\n`;
        output += `  Heap %           : ${status.memoryUsage.heapPercent}%\n`;
        output += `  System %         : ${status.memoryUsage.systemPercent}%\n`;

        // System Info
        if (!sysInfo.error) {
            output += '\n🖥️  SYSTEM INFO:\n';
            output += `  Machine Name     : ${sysInfo.machine}\n`;
            output += `  OS               : ${sysInfo.os}\n`;
            output += `  Platform         : ${sysInfo.platform}\n`;
            output += `  Architecture     : ${sysInfo.arch}\n`;
            output += `  CPU Cores        : ${sysInfo.cpus}\n`;
            output += `  CPU Model        : ${sysInfo.cpuModel}\n`;
            output += `  System Uptime    : ${sysInfo.systemUptime}\n`;
            output += `  Memory Total     : ${sysInfo.totalMemory}\n`;
            output += `  Memory Used      : ${sysInfo.usedMemory}\n`;
            output += `  Memory Free      : ${sysInfo.freeMemory}\n`;
            output += `  Memory Percent   : ${sysInfo.memoryUsagePercent}%\n`;
            output += `  Timezone         : ${sysInfo.timezone}\n`;

            if (sysInfo.networkIPs.length > 0) {
                output += '\n🌐 NETWORK:\n';
                for (const ip of sysInfo.networkIPs) {
                    output += `  ${ip.interface.padEnd(12)} : ${ip.ip}\n`;
                }
            }
        }

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show server uptime
     */
    showUptime() {
        const serverUptime = Date.now() - this.startTime;
        const systemUptime = os.uptime();

        let output = '\n⏱️  UPTIME INFORMATION\n';
        output += '─'.repeat(50) + '\n';
        output += `  Server Uptime    : ${this.formatUptime(serverUptime / 1000)}\n`;
        output += `  System Uptime    : ${this.formatUptime(systemUptime)}\n`;
        output += `  Current Time     : ${this.formatTimestamp(new Date())}\n`;
        output += '─'.repeat(50) + '\n';

        return output;
    }

    /**
     * Show detailed system info
     */
    async showSystemInfo() {
        const sysInfo = await this.getSystemInfo();

        if (sysInfo.error) {
            return `❌ Error getting system info: ${sysInfo.error}`;
        }

        let output = '\n🖥️  DETAILED SYSTEM INFORMATION\n';
        output += '═'.repeat(50) + '\n';

        output += `  Machine Name     : ${sysInfo.machine}\n`;
        output += `  OS Type          : ${sysInfo.os}\n`;
        output += `  Platform         : ${sysInfo.platform}\n`;
        output += `  Architecture     : ${sysInfo.arch}\n`;
        output += `  CPU Cores        : ${sysInfo.cpus}\n`;
        output += `  CPU Model        : ${sysInfo.cpuModel}\n`;
        output += `  Timezone         : ${sysInfo.timezone}\n`;

        output += '\n  Memory Information:\n';
        output += `    Total          : ${sysInfo.totalMemory}\n`;
        output += `    Used           : ${sysInfo.usedMemory}\n`;
        output += `    Free           : ${sysInfo.freeMemory}\n`;
        output += `    Usage %        : ${sysInfo.memoryUsagePercent}%\n`;

        output += '\n  System Uptime    : ' + sysInfo.systemUptime + '\n';

        if (sysInfo.networkIPs.length > 0) {
            output += '\n  Network Interfaces:\n';
            for (const ip of sysInfo.networkIPs) {
                output += `    ${ip.interface.padEnd(14)} : ${ip.ip}\n`;
            }
        }

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show connected devices
     */
    async showDevices() {
        let devices = [];
        try {
            if (this.deviceMonitor && typeof this.deviceMonitor.getAllDevices === 'function') {
                const result = this.deviceMonitor.getAllDevices();
                // Handle both sync and async results
                devices = result instanceof Promise ? await result : result;
            } else {
                return '❌ Device monitor unavailable or missing getAllDevices() method.\n   Check that the correct device registry is passed to CLIHandler.\n';
            }
        } catch (err) {
            return `❌ Error fetching devices: ${err.message}\n`;
        }

        let output = '\n📱 CONNECTED DEVICES\n';
        output += '═'.repeat(50) + '\n';

        if (devices.length === 0) {
            output += '  No devices connected\n';
        } else {
            output += `  Total Devices    : ${devices.length}\n\n`;

            for (let i = 0; i < devices.length; i++) {
                const device = devices[i];
                // Map database column names
                const deviceId = device.id || device.device_id || 'Unknown';
                const status = device.deviceState || device.status || 'unknown';
                const statusIcon = status === 'online' ? '🟢' : '🔴';
                const name = device.name || device.device_name || deviceId;
                const ping = device.ping || device.avg_ping || 0;
                const messageCount = device.message_count || device.messageCount || 0;
                const lastConnection = device.lastConnection || device.last_seen || new Date();
                const createdAt = device.created_at || device.createdAt || new Date();
                
                output += `  [${i + 1}] ${statusIcon} ${name}\n`;
                output += `      ID           : ${deviceId}\n`;
                output += `      Status       : ${status}\n`;
                output += `      Ping         : ${ping}ms\n`;
                output += `      Messages     : ${messageCount}\n`;
                output += `      Last Conn    : ${this.formatTimestamp(new Date(lastConnection))}\n`;
                output += `      Registered   : ${this.formatTimestamp(new Date(createdAt))}\n`;
                output += '\n';
            }
        }

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show recent logs
     */
    showLogs(count = '10') {
        const numCount = Math.min(parseInt(count) || 10, 50);
        const logAggregator = this.logger.getLogAggregator();
        const logs = logAggregator.getLatestLogs(numCount);

        let output = `\n📋 RECENT LOGS (Last ${logs.length})\n`;
        output += '═'.repeat(50) + '\n';

        if (logs.length === 0) {
            output += '  No logs available\n';
        } else {
            for (const log of logs) {
                const levelEmoji = {
                    'error': '❌',
                    'warn': '⚠️ ',
                    'info': 'ℹ️ ',
                    'success': '✅',
                    'debug': '🔍',
                };

                output += `  ${levelEmoji[log.level] || '•'} [${log.level.toUpperCase()}] ${log.section}\n`;
                output += `     ${log.message} (${log.timestamp}ms)\n`;
            }
        }

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show memory usage
     */
    showMemory() {
        const memUsage = this.systemMonitor.getMemoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const systemMemoryPercent = this.getSystemMemoryPercent();
        const health = this.systemMonitor.checkMemoryHealth();

        let output = '\n💾 MEMORY USAGE DETAILS\n';
        output += '═'.repeat(50) + '\n';

        output += '  Process Memory (Node.js):\n';
        output += `    Heap Used        : ${memUsage.heapUsed}\n`;
        output += `    Heap Total       : ${memUsage.heapTotal}\n`;
        output += `    Heap %           : ${memUsage.heapUsedPercent}%\n`;
        output += `    RSS              : ${memUsage.rss}\n`;

        output += '\n  System Memory:\n';
        output += `    Total            : ${this.formatBytes(totalMemory)}\n`;
        output += `    Free             : ${this.formatBytes(freeMemory)}\n`;
        output += `    Usage %          : ${systemMemoryPercent}%\n`;
        output += `    Health           : ${health === 'HEALTHY' ? '✅ HEALTHY' : health === 'WARNING' ? '⚠️ WARNING' : '🔴 CRITICAL'}\n`;

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show metrics
     */
    async showMetrics() {
        const status = await this.getServerStatus();
        let devices = [];
        let onlineDevices = 0;
        let offlineDevices = 0;
        
        try {
            if (this.deviceMonitor && typeof this.deviceMonitor.getAllDevices === 'function') {
                const result = this.deviceMonitor.getAllDevices();
                // Handle both sync and async results
                devices = result instanceof Promise ? await result : result;
                onlineDevices = devices.filter(d => d.status === 'online').length;
                offlineDevices = devices.filter(d => d.status === 'offline').length;
            }
        } catch (err) {
            this.logger.warn(`deviceMonitor error in showMetrics: ${err.message}`, 'CLI');
        }

        let output = '\n📊 SYSTEM METRICS\n';
        output += '═'.repeat(50) + '\n';

        output += '  Server Metrics:\n';
        output += `    Uptime         : ${status.serverUptime}\n`;
        output += `    Commands       : ${status.commandsExecuted}\n`;

        output += '\n  Device Metrics:\n';
        output += `    Total          : ${status.connectedDevices}\n`;
        output += `    Online         : ${onlineDevices}\n`;
        output += `    Offline        : ${offlineDevices}\n`;
        output += `    Messages       : ${status.totalMessages}\n`;
        output += `    Avg Ping       : ${status.avgPing.toFixed(0)}ms\n`;

        output += '\n  Performance:\n';
        output += `    Heap %         : ${status.memoryUsage.heapPercent}%\n`;
        output += `    System %       : ${status.memoryUsage.systemPercent}%\n`;
        output += `    Heap Used      : ${status.memoryUsage.heapUsed}\n`;

        output += '═'.repeat(50) + '\n';
        return output;
    }

    /**
     * Show banner
     */
    showBanner() {
        let output = '\n';
        output += '╭─────────────────────────────────────╮\n';
        output += '│   🤖 BOTIFY SERVICE - CLI CONSOLE   │\n';
        output += '╰─────────────────────────────────────╯\n';
        output += '\n  Type "help" for available commands\n\n';
        console.log(output);
    }
    /**
     * Show restart message and trigger restart
     */
    showRestart() {
        let output = '\n🔄 Restarting server...\n';
        output += '─'.repeat(50) + '\n';
        output += '  Server will restart in 1 second.\n';
        output += '─'.repeat(50) + '\n';
        return output;
    }
}

export default CLICommands;
