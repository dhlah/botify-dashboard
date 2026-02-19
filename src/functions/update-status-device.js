import { pool } from "../lib/db/connection.js";
import logger from "../lib/logger/logger.js";

async function updateDeviceStatus(deviceId, status, timestamp = null) {
    if (!deviceId || !status) {
        logger.error("Device ID and status are required to update device status.");
        return false;
    }
    try {
        // If status is offline, also update lastConnection timestamp
        if (status === 'offline' && timestamp) {
            const [result] = await pool.query(
                "UPDATE device SET deviceState = ?, lastConnection = ? WHERE id = ?",
                [status, timestamp, deviceId]
            );
            if (result.affectedRows === 0) {
                logger.warn(`No device found with ID: ${deviceId} to update status.`);
                return false;
            }
            logger.debug(`Device ID ${deviceId} status updated to ${status}, lastConnection set to ${timestamp}`);
            return true;
        } else {
            // Just update status
            const [result] = await pool.query(
                "UPDATE device SET deviceState = ? WHERE id = ?",
                [status, deviceId]
            );
            if (result.affectedRows === 0) {
                logger.warn(`No device found with ID: ${deviceId} to update status.`);
                return false;
            }
            logger.debug(`Device ID ${deviceId} status updated to ${status}`);
            return true;
        }
    }
    catch (error) {
        logger.error(`Error updating status for device ID ${deviceId}: ${error.message}`);
        return false;
    }
}

export default updateDeviceStatus;