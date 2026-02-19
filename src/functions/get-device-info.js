import { pool } from "../lib/db/connection.js";
import logger from "../lib/logger/logger.js";

async function getDeviceInfo(id) {
    if (!id) {
        logger.error("Device ID is required to fetch device info.");
        return null;
    }
    try {
        const [rows] = await pool.query("SELECT * FROM device WHERE id = ?", [id]);
        if (rows.length === 0) {
            logger.warn(`No device found with ID: ${id}`);
            return null;
        }
        return rows[0];
    } catch (error) {
        logger.error(`Error fetching device info for ID ${id}: ${error.message}`);
        return null;
    }
}

export default getDeviceInfo;