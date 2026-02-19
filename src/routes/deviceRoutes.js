import express from 'express';
import logger from '../lib/logger/logger.js';
import getDeviceInfo from '../functions/get-device-info.js';
import getLogValueDevice from '../functions/get-log-value-device.js';
import { getLogValueDeviceByRange, getLogValueDeviceSummary } from '../functions/get-log-value-device-by-range.js';
import getAllDevices from '../functions/get-all-device.js';

const router = express.Router();

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.get('/device', async (req, res) => {
    logger.debug('Received request for device list');
    res.render('devices.ejs', {
        devices: await getAllDevices()
    });
});


router.get('/device/:id', async (req, res) => {
    const deviceId = req.params.id;
    logger.debug(`Received request for device ID: ${deviceId}`);

    const deviceInfo = await getDeviceInfo(deviceId);

    if (!deviceInfo) {
        return res.status(404).send('Device not found');
    }

    const lastValue = await getLogValueDevice(deviceId, 1); // Assume this function is defined elsewhere


    res.render('device.ejs', {
        deviceId,
        deviceInfo,
        lastValue: lastValue[0] || null,
        formatTime
    });
});

router.get('/device/:id/logs', async (req, res) => {
    const deviceId = req.params.id;
    logger.debug(`Received request for device logs ID: ${deviceId}`);
    const deviceInfo = await getDeviceInfo(deviceId);
    if (!deviceInfo) {
        return res.status(404).send('Device not found');
    }
    
    const timeRange = req.query.timeRange || '1h';
    const limit = req.query.limit || 100;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    const logs = await getLogValueDeviceByRange(deviceId, limit, timeRange, startDate, endDate);
    
    res.render('device-logs.ejs', {
        deviceId,
        deviceInfo,
        logs: logs || [],
        formatTime,
        timeRange
    });
});

// API endpoint for logs (JSON response for AJAX)
router.get('/api/device/:id/logs', async (req, res) => {
    const deviceId = req.params.id;
    const timeRange = req.query.timeRange || '1h';
    const limit = req.query.limit || 100;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    try {
        const logs = await getLogValueDeviceByRange(deviceId, limit, timeRange, startDate, endDate);
        res.json({
            success: true,
            deviceId,
            timeRange,
            limit,
            logs: logs || []
        });
    } catch (error) {
        logger.error(`Error fetching logs: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint for summary statistics
router.get('/api/device/:id/summary', async (req, res) => {
    const deviceId = req.params.id;
    const timeRange = req.query.timeRange || '1h';
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    try {
        logger.debug(`Fetching summary for device ${deviceId}, timeRange: ${timeRange}`);
        const summary = await getLogValueDeviceSummary(deviceId, timeRange, startDate, endDate);
        
        if (!summary) {
            logger.error(`Summary returned null for device ${deviceId}`);
            return res.json({
                success: true,
                deviceId,
                timeRange,
                summary: {
                    totalRecords: 0,
                    onCount: 0,
                    offCount: 0,
                    onPercentage: 0,
                    offPercentage: 0,
                    totalOnDuration: 0,
                    totalOffDuration: 0,
                    totalOnDurationMinutes: '0.00',
                    totalOffDurationMinutes: '0.00'
                }
            });
        }
        
        logger.debug(`Summary for device ${deviceId}: ${JSON.stringify(summary)}`);
        res.json({
            success: true,
            deviceId,
            timeRange,
            summary
        });
    } catch (error) {
        logger.error(`Error fetching summary: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


export default router;
