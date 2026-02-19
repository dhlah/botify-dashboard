import { pool } from '../lib/db/connection.js';
import logger from '../lib/logger/logger.js';
import { v4 as uuidv4 } from 'uuid';

async function saveValueToDatabase(deviceId, value) {
    if (!deviceId || value === undefined || value === null)
        return false;

    try {

        const newValue = String(value);

        const isBinary = newValue === "0" || newValue === "1";

        if (isBinary) {

            // ambil binary terakhir saja
            const [rows] = await pool.query(
                `SELECT value
                 FROM device_values
                 WHERE device_id = ?
                 AND value IN ('0','1')
                 ORDER BY timestamp DESC
                 LIMIT 1`,
                [deviceId]
            );

            if (rows.length > 0) {

                const lastBinary = String(rows[0].value);

                if (lastBinary === newValue) {
                    logger.warn(`Skip duplicate binary (${deviceId})`);
                    return false;
                }
            }
        }

        // insert semua value non binary atau binary berbeda
        await pool.query(
            `INSERT INTO device_values
             (id, device_id, value, timestamp)
             VALUES (?, ?, ?, NOW())`,
            [uuidv4(), deviceId, newValue]
        );

        return true;

    } catch (err) {
        logger.error(err.message);
        return false;
    }
}



export default saveValueToDatabase;