import chalk from 'chalk';

/**
 * Log Aggregator & Analyzer
 * Mengumpulkan dan menganalisis logs untuk reports
 */
class LogAggregator {
    constructor(maxLogs = 1000) {
        this.logs = [];
        this.maxLogs = maxLogs;
        this.errorCounts = {};
        this.warnCounts = {};
    }

    /**
     * Add log entry
     */
    addLog(level, message, section, timestamp) {
        const logEntry = {
            level,
            message,
            section,
            timestamp,
            id: `${timestamp.getTime()}-${Math.random()}`
        };

        this.logs.push(logEntry);

        // Track counts
        if (level === 'error') {
            this.errorCounts[section] = (this.errorCounts[section] || 0) + 1;
        } else if (level === 'warn') {
            this.warnCounts[section] = (this.warnCounts[section] || 0) + 1;
        }

        // Keep max logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    /**
     * Get logs by section
     */
    getLogsBySection(section) {
        return this.logs.filter(log => log.section === section);
    }

    /**
     * Get logs in time range
     */
    getLogsByTimeRange(startTime, endTime) {
        return this.logs.filter(log => 
            log.timestamp >= startTime && log.timestamp <= endTime
        );
    }

    /**
     * Get latest logs
     */
    getLatestLogs(count = 10) {
        return this.logs.slice(-count);
    }

    /**
     * Get error report
     */
    getErrorReport() {
        const errorLogs = this.getLogsByLevel('error');
        return {
            totalErrors: errorLogs.length,
            errorsBySection: this.errorCounts,
            recentErrors: errorLogs.slice(-5)
        };
    }

    /**
     * Get warning report
     */
    getWarningReport() {
        const warnLogs = this.getLogsByLevel('warn');
        return {
            totalWarnings: warnLogs.length,
            warningsBySection: this.warnCounts,
            recentWarnings: warnLogs.slice(-5)
        };
    }

    /**
     * Print log report
     */
    printLogReport() {
        console.log('');
        console.log(chalk.cyan.bold('📝 LOG REPORT'));
        console.log(chalk.cyan('─'.repeat(60)));

        const errorReport = this.getErrorReport();
        const warnReport = this.getWarningReport();
        const infoLogs = this.getLogsByLevel('info').length;
        const successLogs = this.getLogsByLevel('success').length;

        console.log(`  ${chalk.red('✗')} Total Errors       : ${errorReport.totalErrors}`);
        console.log(`  ${chalk.yellow('⚠')} Total Warnings     : ${warnReport.totalWarnings}`);
        console.log(`  ${chalk.blue('ℹ')} Total Info Logs    : ${infoLogs}`);
        console.log(`  ${chalk.green('✓')} Total Success Logs : ${successLogs}`);
        console.log(`  ${chalk.magenta('📝')} Total Logs        : ${this.logs.length}/${this.maxLogs}`);

        console.log('');
        console.log(chalk.bold('  Errors by Section:'));
        Object.entries(errorReport.errorsBySection).forEach(([section, count]) => {
            console.log(`    ${section.padEnd(20)} : ${count}`);
        });

        if (Object.keys(errorReport.errorsBySection).length === 0) {
            console.log('    No errors recorded');
        }

        console.log('');
        console.log(chalk.bold('  Warnings by Section:'));
        Object.entries(warnReport.warningsBySection).forEach(([section, count]) => {
            console.log(`    ${section.padEnd(20)} : ${count}`);
        });

        if (Object.keys(warnReport.warningsBySection).length === 0) {
            console.log('    No warnings recorded');
        }

        console.log(chalk.cyan('─'.repeat(60)));
    }

    /**
     * Get summary stats
     */
    getSummaryStats() {
        return {
            totalLogs: this.logs.length,
            totalErrors: this.getLogsByLevel('error').length,
            totalWarnings: this.getLogsByLevel('warn').length,
            totalInfo: this.getLogsByLevel('info').length,
            totalSuccess: this.getLogsByLevel('success').length,
            errorsBySection: this.errorCounts,
            warningsBySection: this.warnCounts,
            sections: [...new Set(this.logs.map(log => log.section))]
        };
    }

    /**
     * Clear logs
     */
    clear() {
        this.logs = [];
        this.errorCounts = {};
        this.warnCounts = {};
    }

    /**
     * Export logs as JSON
     */
    export() {
        return {
            exportTime: new Date().toISOString(),
            logs: this.logs,
            stats: this.getSummaryStats()
        };
    }
}

// Create singleton instance
const logAggregator = new LogAggregator();

export default logAggregator;
