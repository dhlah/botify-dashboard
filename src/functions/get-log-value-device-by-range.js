import { pool } from '../lib/db/connection.js';
import logger from '../lib/logger/logger.js';

/* =========================================================
   TIME RANGE HELPERS
========================================================= */

const RANGE_BUILDERS = {
    '10m': () => new Date(Date.now() - 10 * 60 * 1000),
    '1h': () => new Date(Date.now() - 60 * 60 * 1000),
    '1d': () => new Date(Date.now() - 24 * 60 * 60 * 1000),
    '1month': () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    '1year': () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    'thisMonth': () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    'thisYear': () => new Date(new Date().getFullYear(), 0, 1)
};

function getLastMonthRange() {
    const now = new Date();
    return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    };
}

function formatMySQLDateTime(date = new Date()) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

/* =========================================================
   WHERE BUILDER
========================================================= */

function buildWhereClause(deviceId, timeRange, startDate, endDate) {
    let clause = 'WHERE device_id = ?';
    const params = [deviceId];

    if (!timeRange) return { clause, params };

    if (RANGE_BUILDERS[timeRange]) {
        clause += ' AND timestamp >= ?';
        params.push(formatMySQLDateTime(RANGE_BUILDERS[timeRange]()));
        return { clause, params };
    }

    if (timeRange === 'lastMonth') {
        const { start, end } = getLastMonthRange();
        clause += ' AND timestamp BETWEEN ? AND ?';
        params.push(formatMySQLDateTime(start), formatMySQLDateTime(end));
        return { clause, params };
    }

    if (timeRange === 'custom' && startDate && endDate) {
        clause += ' AND timestamp BETWEEN ? AND ?';
        params.push(
            formatMySQLDateTime(new Date(startDate)),
            formatMySQLDateTime(new Date(endDate))
        );
    }

    return { clause, params };
}

/* =========================================================
   GET LOG LIST
========================================================= */

async function getLogValueDeviceByRange(
    deviceId,
    limit = 10,
    timeRange = '1h',
    startDate = null,
    endDate = null
) {
    if (!deviceId) {
        logger.error("Device ID is required.");
        return null;
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    try {
        const { clause, params } = buildWhereClause(
            deviceId,
            timeRange,
            startDate,
            endDate
        );

        const [rows] = await pool.query(
            `SELECT value, timestamp
             FROM device_values
             ${clause}
             ORDER BY timestamp DESC
             LIMIT ?`,
            [...params, safeLimit]
        );

        return rows;
    } catch (err) {
        logger.error(`Fetch logs failed: ${err.message}`);
        return null;
    }
}

/* =========================================================
   SUMMARY (ONLY 0 AND 1)
========================================================= */

async function getLogValueDeviceSummary(
    deviceId,
    timeRange = '1h',
    startDate = null,
    endDate = null
) {
    if (!deviceId) {
        logger.error("Device ID is required.");
        return null;
    }

    try {
        const { clause, params } = buildWhereClause(
            deviceId,
            timeRange,
            startDate,
            endDate
        );

        const [rows] = await pool.query(
            `SELECT value, timestamp
             FROM device_values
             ${clause}
             AND value IN ('0','1')
             ORDER BY timestamp ASC`,
            params
        );

        if (!rows.length) return emptySummary();

        let onDuration = 0;
        let offDuration = 0;

        let lastValue = parseInt(rows[0].value);
        let lastTime = new Date(rows[0].timestamp);

        for (let i = 1; i < rows.length; i++) {
            const currentTime = new Date(rows[i].timestamp);
            const duration = (currentTime - lastTime) / 1000;

            if (lastValue === 1) onDuration += duration;
            else offDuration += duration;

            lastValue = parseInt(rows[i].value);
            lastTime = currentTime;
        }

        // hitung sampai waktu sekarang
        const now = new Date();
        const lastDuration = (now - lastTime) / 1000;

        if (lastValue === 1) onDuration += lastDuration;
        else offDuration += lastDuration;

        const total = onDuration + offDuration;

        const onCount = rows.filter(r => r.value === '1').length;
        const offCount = rows.filter(r => r.value === '0').length;

        return {
            totalRecords: rows.length,
            onCount,
            offCount,
            lastValue,

            onPercentage: total ? +(onDuration / total * 100).toFixed(2) : 0,
            offPercentage: total ? +(offDuration / total * 100).toFixed(2) : 0,

            totalOnDuration: Math.round(onDuration),
            totalOffDuration: Math.round(offDuration),

            totalOnDurationMinutes: (onDuration / 60).toFixed(2),
            totalOffDurationMinutes: (offDuration / 60).toFixed(2)
        };

    } catch (err) {
        logger.error(`Summary error: ${err.message}`);
        return null;
    }
}

/* =========================================================
   EMPTY SUMMARY TEMPLATE
========================================================= */

function emptySummary() {
    return {
        totalRecords: 0,
        onCount: 0,
        offCount: 0,
        lastValue: null,
        onPercentage: 0,
        offPercentage: 0,
        totalOnDuration: 0,
        totalOffDuration: 0,
        totalOnDurationMinutes: '0.00',
        totalOffDurationMinutes: '0.00'
    };
}

/* ========================================================= */

export {
    getLogValueDeviceByRange,
    getLogValueDeviceSummary
};
