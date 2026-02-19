/**
 * Botify Logger Suite
 * Complete logging, monitoring, and analytics system
 */

import logger from './logger.js';
import logAggregator from './log-aggregator.js';
import deviceMonitor from './device-monitor.js';
import systemMonitor from './system-monitor.js';

/**
 * Initialize all monitoring systems
 */
function initializeMonitoring() {
    logger.printBanner();
    return {
        logger,
        logAggregator,
        deviceMonitor,
        systemMonitor
    };
}

/**
 * Print full system report
 */
function printFullReport() {
    systemMonitor.printSystemMonitoring();
    deviceMonitor.printDeviceMonitoring();
    logAggregator.printLogReport();
    logger.printMonitoringMetrics();
}

/**
 * Export all monitoring utilities
 */
export {
    logger,
    logAggregator,
    deviceMonitor,
    systemMonitor,
    initializeMonitoring,
    printFullReport
};

export default logger;
