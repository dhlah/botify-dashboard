import { pool } from '../lib/db/connection.js';
import logger from '../lib/logger/logger.js';

async function getAllDevices() {
    try {
        const [rows] = await pool.query('SELECT * FROM device');
        return rows;
    }
    catch (error) {
        logger.error('Error fetching devices:', error);
        throw error;
    }
}

export default getAllDevices;