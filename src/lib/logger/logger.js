import chalk from 'chalk';
import figlet from 'figlet';
import dotenv from 'dotenv';
import logAggregator from './log-aggregator.js';

dotenv.config();

class BotifyLogger {
    constructor() {
        this.startTime = Date.now();
        this.environment = process.env.NODE_ENV || 'development';
        this.logLevel = process.env.BOTIFY_LOG_LEVEL || this.getDefaultLogLevel();
        this.metrics = {
            info: 0,
            warn: 0,
            error: 0,
            debug: 0,
            success: 0
        };
        this.logs = [];
        this.cliActive = false;
        
        // Log levels hierarchy
        this.levels = {
            'error': 0,
            'warn': 1,
            'info': 2,
            'success': 2,
            'debug': 3
        };
    }

    /**
     * Get default log level berdasarkan environment
     */
    getDefaultLogLevel() {
        if (this.environment === 'production') {
            return 'info'; // Production: hanya error, warn, info, success
        }
        return 'debug'; // Development: semua level
    }

    /**
     * Check apakah log level should ditampilkan
     */
    shouldLog(level) {
        const logLevelValue = this.levels[this.logLevel] || this.levels['debug'];
        const messageLevelValue = this.levels[level] || this.levels['debug'];
        return messageLevelValue <= logLevelValue;
    }

    /**
     * Get environment info
     */
    isProduction() {
        return this.environment === 'production';
    }

    isDebugEnabled() {
        return this.logLevel === 'debug' || this.environment === 'development';
    }

    /**
     * Display ASCII art banner
     */
    printBanner() {
        const banner = figlet.textSync('BOTIFY SERVICE', {
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });
        console.log(chalk.cyan(banner));
        console.log(chalk.blue.bold('═'.repeat(60)));
        console.log(chalk.blue.bold('  🤖 IoT Dashboard with MQTT & Telegram Notifications'));
        console.log(chalk.blue.bold('═'.repeat(60)));
        console.log('');
    }

    /**
     * Format timestamp
     */
    getTimestamp() {
        const date = new Date();
        return chalk.gray(`[${date.toLocaleString('id-ID')}]`);
    }

    /**
     * Get uptime in ms
     */
    getUptime() {
        return Date.now() - this.startTime;
    }

    /**
     * Format timestamp with milliseconds
     */
    getPingMs() {
        const ms = this.getUptime();
        if (ms < 1000) return chalk.green(`${ms}ms`);
        if (ms < 60000) return chalk.yellow(`${(ms / 1000).toFixed(2)}s`);
        return chalk.cyan(`${(ms / 60000).toFixed(2)}m`);
    }

    /**
     * Info level log
     */
    info(message, section = 'INFO') {
        this.metrics.info++;
        const timestamp = new Date();
        const log = {
            level: 'info',
            message,
            section,
            timestamp,
            uptime: this.getUptime()
        };
        this.logs.push(log);
        logAggregator.addLog('info', message, section, timestamp);
        
        console.log(
            `${this.getTimestamp()} ${chalk.blue.bold(`[${section}]`)} ${chalk.white(message)} ${chalk.gray(this.getPingMs())}`
        );
    }

    /**
     * Success level log
     */
    success(message, section = 'SUCCESS') {
        this.metrics.success++;
        const timestamp = new Date();
        const log = {
            level: 'success',
            message,
            section,
            timestamp,
            uptime: this.getUptime()
        };
        this.logs.push(log);
        logAggregator.addLog('success', message, section, timestamp);
        
        console.log(
            `${this.getTimestamp()} ${chalk.green.bold(`[${section}]`)} ${chalk.green('✓')} ${chalk.white(message)} ${chalk.gray(this.getPingMs())}`
        );
    }

    /**
     * Warning level log
     */
    warn(message, section = 'WARNING') {
        this.metrics.warn++;
        const timestamp = new Date();
        const log = {
            level: 'warn',
            message,
            section,
            timestamp,
            uptime: this.getUptime()
        };
        this.logs.push(log);
        logAggregator.addLog('warn', message, section, timestamp);
        
        console.log(
            `${this.getTimestamp()} ${chalk.yellow.bold(`[${section}]`)} ${chalk.yellow('⚠')} ${chalk.white(message)} ${chalk.gray(this.getPingMs())}`
        );
    }

    /**
     * Error level log
     */
    error(message, section = 'ERROR') {
        this.metrics.error++;
        const timestamp = new Date();
        const log = {
            level: 'error',
            message,
            section,
            timestamp,
            uptime: this.getUptime()
        };
        this.logs.push(log);
        logAggregator.addLog('error', message, section, timestamp);
        
        console.log(
            `${this.getTimestamp()} ${chalk.red.bold(`[${section}]`)} ${chalk.red('✗')} ${chalk.white(message)} ${chalk.gray(this.getPingMs())}`
        );
    }

    /**
     * Debug level log
     * Hidden in production unless explicitly enabled
     * Uses stderr to avoid interfering with readline in CLI
     */
    debug(message, section = 'DEBUG') {
        this.metrics.debug++;
        const timestamp = new Date();
        const log = {
            level: 'debug',
            message,
            section,
            timestamp,
            uptime: this.getUptime()
        };
        this.logs.push(log);
        logAggregator.addLog('debug', message, section, timestamp);
        
        // Only show debug logs if not in production or debug is enabled
        // But hide while CLI is active to avoid prompt interference
        if (this.shouldLog('debug') && !this.cliActive) {
            const output = `${this.getTimestamp()} ${chalk.magenta.bold(`[${section}]`)} ${chalk.gray(message)} ${chalk.gray(this.getPingMs())}`;
            // Use stderr to avoid interfering with readline prompt in CLI
            process.stderr.write(output + '\n');
        }
    }

    /**
     * Log monitoring metrics section
     */
    printMonitoringMetrics() {
        console.log('');
        console.log(chalk.cyan.bold('📊 MONITORING METRICS'));
        console.log(chalk.cyan('─'.repeat(60)));
        
        const metrics = [
            ['Type', 'Count', 'Status'],
            ['Success', this.metrics.success.toString(), chalk.green('✓')],
            ['Info', this.metrics.info.toString(), chalk.blue('ℹ')],
            ['Warning', this.metrics.warn.toString(), chalk.yellow('⚠')],
            ['Error', this.metrics.error.toString(), chalk.red('✗')],
            ['Debug', this.metrics.debug.toString(), chalk.magenta('🐛')],
            ['Total Logs', this.logs.length.toString(), chalk.white('📝')],
            ['Uptime', `${(this.getUptime() / 1000).toFixed(2)}s`, chalk.cyan('⏱')]
        ];
        
        // Simple table format
        metrics.forEach((row, idx) => {
            if (idx === 0) {
                console.log(chalk.bold(`  ${row[0].padEnd(15)} │ ${row[1].padEnd(8)} │ ${row[2]}`));
                console.log(chalk.gray('  ─'.repeat(25)));
            } else {
                console.log(`  ${row[0].padEnd(15)} │ ${row[1].padEnd(8)} │ ${row[2]}`);
            }
        });
        
        console.log(chalk.cyan('─'.repeat(60)));
    }

    /**
     * Log connected devices section
     */
    printDeviceMonitoring(devices = []) {
        console.log('');
        console.log(chalk.green.bold('🔌 DEVICE MONITORING'));
        console.log(chalk.green('─'.repeat(60)));
        
        if (devices.length === 0) {
            console.log(chalk.gray('  No devices connected yet'));
        } else {
            const headers = ['Device ID', 'Name', 'Status', 'Last Ping'];
            console.log(chalk.bold(
                `  ${headers[0].padEnd(15)} │ ${headers[1].padEnd(15)} │ ${headers[2].padEnd(10)} │ ${headers[3]}`
            ));
            console.log(chalk.gray('  ─'.repeat(55)));
            
            devices.forEach(device => {
                const status = device.status === 'online' ? chalk.green('●') : chalk.red('●');
                console.log(
                    `  ${(device.id || '-').toString().padEnd(15)} │ ${(device.name || '-').toString().padEnd(15)} │ ${status} ${(device.status || 'unknown').padEnd(6)} │ ${device.lastPing || 'N/A'}`
                );
            });
        }
        
        console.log(chalk.green('─'.repeat(60)));
    }

    /**
     * Log system info section
     */
    printSystemInfo(info = {}) {
        console.log('');
        console.log(chalk.magenta.bold('💻 SYSTEM INFORMATION'));
        console.log(chalk.magenta('─'.repeat(60)));
        
        const systemInfo = [
            ['Server', info.serverUrl || 'http://localhost:3000'],
            ['API Port', info.apiPort || '3000'],
            ['MQTT Port', info.mqttPort || '1883'],
            ['Environment', info.environment || 'development'],
            ['Node Version', info.nodeVersion || 'N/A'],
            ['Uptime', `${(this.getUptime() / 1000).toFixed(2)}s`]
        ];
        
        systemInfo.forEach(([key, value]) => {
            console.log(`  ${key.padEnd(20)} : ${chalk.white(value)}`);
        });
        
        console.log(chalk.magenta('─'.repeat(60)));
    }

    /**
     * Log section divider
     */
    printSection(title, content = []) {
        console.log('');
        console.log(chalk.blue.bold(`📌 ${title}`));
        console.log(chalk.blue('─'.repeat(60)));
        
        if (Array.isArray(content) && content.length > 0) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    console.log(`  ${item}`);
                } else if (typeof item === 'object') {
                    Object.entries(item).forEach(([key, value]) => {
                        console.log(`  ${key.padEnd(20)} : ${chalk.white(value)}`);
                    });
                }
            });
        }
        
        console.log(chalk.blue('─'.repeat(60)));
    }

    /**
     * Get logger statistics
     */
    getStats() {
        return {
            ...this.metrics,
            totalLogs: this.logs.length,
            uptime: this.getUptime(),
            uptimeFormatted: `${(this.getUptime() / 1000).toFixed(2)}s`
        };
    }

    /**
     * Clear metrics
     */
    reset() {
        this.startTime = Date.now();
        this.logs = [];
        this.metrics = {
            info: 0,
            warn: 0,
            error: 0,
            debug: 0,
            success: 0
        };
    }

    /**
     * Print logging configuration
     */
    printLoggingConfig() {
        console.log('');
        console.log(chalk.cyan.bold('⚙️ LOGGING CONFIGURATION'));
        console.log(chalk.cyan('─'.repeat(60)));
        
        const config = [
            ['Environment', this.environment.toUpperCase()],
            ['Log Level', this.logLevel.toUpperCase()],
            ['Debug Enabled', this.isDebugEnabled() ? 'YES ✓' : 'NO ✗'],
            ['Production Mode', this.isProduction() ? 'YES' : 'NO'],
            ['Console Debug Logs', this.shouldLog('debug') ? 'VISIBLE' : 'HIDDEN']
        ];
        
        config.forEach(([key, value]) => {
            const status = value.includes('YES') ? chalk.green(value) 
                         : value.includes('NO') ? chalk.red(value)
                         : value.includes('VISIBLE') ? chalk.green(value)
                         : value.includes('HIDDEN') ? chalk.yellow(value)
                         : chalk.white(value);
            console.log(`  ${key.padEnd(20)} : ${status}`);
        });
        
        console.log(chalk.cyan('─'.repeat(60)));
    }

    /**
     * Get environment information
     */
    getEnvironmentInfo() {
        return {
            environment: this.environment,
            logLevel: this.logLevel,
            isProduction: this.isProduction(),
            isDebugEnabled: this.isDebugEnabled(),
            debugVisible: this.shouldLog('debug')
        };
    }

    /**
     * Set log level dynamically
     */
    setLogLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            const oldLevel = this.logLevel;
            this.logLevel = level;
            this.info(`Log level changed from ${oldLevel} to ${level}`, 'LOGGER-CONFIG');
            return true;
        }
        return false;
    }

    /**
     * Set CLI active status (to reduce debug output interference)
     */
    setCliActive(active = true) {
        this.cliActive = active;
    }

    /**
     * Get log aggregator
     */
    getLogAggregator() {
        return logAggregator;
    }
}

// Create singleton logger instance
const logger = new BotifyLogger();

export default logger;