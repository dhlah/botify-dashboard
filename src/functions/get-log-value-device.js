import { pool } from '../lib/db/connection.js';
import logger from '../lib/logger/logger.js';

async function getLogValueDevice(deviceId, limit = 10) {
    if (!deviceId) {
        logger.error("Device ID is required to fetch log values.");
        return null;
    }
    try {
        const [rows] = await pool.query(
            "SELECT * FROM device_values WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?",
            [deviceId, limit]
        );
        return rows;
    }
    catch (error) {
        logger.error(`Error fetching log values for device ID ${deviceId}: ${error.message}`);
        return null;
    }
}

export default getLogValueDevice;