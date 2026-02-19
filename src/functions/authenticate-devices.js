import { pool } from "../lib/db/connection.js";
import logger from "../lib/logger/logger.js";

async function AuthenticateDevice(client, username, password, callback) {
    if (!username || !password) {
        logger.error('Authentication failed: Missing username or password.');
        return callback(null, false);
    }

    try {
        const pass = password.toString();

        const [rows] = await pool.query(
            "SELECT * FROM device WHERE id = ? AND token = ?",
            [username, pass]
        );

        if (!rows.length) {
            logger.error(`Authentication failed for device ID: ${username}`);
            return callback(null, false);
        }

        logger.debug(`Device ID ${username} authenticated`);
        callback(null, true);

    } catch (err) {
        logger.error(`Auth error ${username}: ${err.message}`);
        callback(err, false);
    }
}

export default AuthenticateDevice;
