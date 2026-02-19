import logger from '../logger/logger.js';
import { pool } from '../db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HOST_URL = process.env.HOST_URL || "http://localhost:3000";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

/**
 * Validasi konfigurasi Telegram
 */
function validateTelegramConfig() {
    if (!TELEGRAM_TOKEN) {
        logger.warn("Telegram token not found. Skipping notification.");
        return false;
    }
    return true;
}

/**
 * Ambil data device dari database
 */
async function getDeviceData(deviceId) {
    try {
        const [rows] = await pool.query(
            `SELECT name, chatId FROM device WHERE id = ?`,
            [deviceId]
        );
        if (rows.length === 0) {
            logger.warn(`Device with ID ${deviceId} not found. Skipping notification.`);
            return null;
        }
        const { name, chatId } = rows[0];
        if (!chatId) {
            logger.warn(`Chat ID for device ${name} not found. Skipping notification.`);
            return null;
        }
        return { name, chatId };
    } catch (error) {
        logger.error(`Error fetching device data: ${error.message}`);
        return null;
    }
}

/**
 * Kirim message ke Telegram
 */
async function sendTelegramMessage(chatId, message) {
    try {
        const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: "HTML"
        };

        const response = await fetch(TELEGRAM_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            logger.error(`Failed to send Telegram notification: ${errorData.description}`);
            return false;
        }
        return true;
    } catch (error) {
        logger.error(`Error sending Telegram message: ${error.message}`);
        return false;
    }
}

/**
 * Format notification message (generic)
 */
function formatNotificationMessage(deviceName, status, additionalInfo = '') {
    const timestamp = new Date().toLocaleString('id-ID');
    
    return `<b>───── [ BOTIFY SERVICE ] ─────</b>

<b>DEVICE :</b> <code>${deviceName}</code>
${status}
${additionalInfo}

📅 <code>${timestamp}</code>
🌐 <code>${HOST_URL}/device</code>
<b>───────────────────────</b>`;
}

/**
 * Kirim notifikasi device offline
 */
async function sendOfflineNotification(deviceId) {
    if (!deviceId) {
        logger.warn("Device ID is required to send notification.");
        return false;
    }

    if (!validateTelegramConfig()) return false;

    try {
        const deviceData = await getDeviceData(deviceId);
        if (!deviceData) return false;

        const message = formatNotificationMessage(
            deviceData.name,
            '<b>STATUS :</b> 🔴 Offline\n<b>INFO   :</b> Perangkat terputus dari jaringan.'
        );

        const success = await sendTelegramMessage(deviceData.chatId, message);
        if (success) {
            logger.info(`Offline notification sent to Telegram for device ${deviceData.name}`);
        }
        return success;
    } catch (error) {
        logger.error(`Error in sendOfflineNotification: ${error.message}`);
        return false;
    }
}

/**
 * Kirim notifikasi device online
 */
async function sendOnlineNotification(deviceId) {
    if (!deviceId) {
        logger.warn("Device ID is required to send notification.");
        return false;
    }

    if (!validateTelegramConfig()) return false;

    try {
        const deviceData = await getDeviceData(deviceId);
        if (!deviceData) return false;

        const message = formatNotificationMessage(
            deviceData.name,
            '<b>STATUS :</b> 🟢 Online\n<b>INFO   :</b> Terkoneksi ke jaringan.'
        );

        const success = await sendTelegramMessage(deviceData.chatId, message);
        if (success) {
            logger.info(`Online notification sent to Telegram for device ${deviceData.name}`);
        }
        return success;
    } catch (error) {
        logger.error(`Error in sendOnlineNotification: ${error.message}`);
        return false;
    }
}

/**
 * Kirim notifikasi perubahan relay
 */
async function sendRelayNotification(deviceId, relayState) {
    if (!deviceId) {
        logger.warn("Device ID is required to send notification.");
        return false;
    }

    if (relayState === undefined || relayState === null) {
        logger.warn("Relay state is required to send notification.");
        return false;
    }

    if (!validateTelegramConfig()) return false;

    try {
        const deviceData = await getDeviceData(deviceId);
        if (!deviceData) return false;

        const relayStatus = relayState === 1 ? "ON" : "OFF";
        const emoji = relayState === 1 ? "🟢" : "🔴";

        const message = formatNotificationMessage(
            deviceData.name,
            `<b>RELAY  :</b> ${relayStatus} ${emoji}\n<b>INFO   :</b> Monitoring status terkini.`
        );

        const success = await sendTelegramMessage(deviceData.chatId, message);
        if (success) {
            logger.info(`Relay notification sent to Telegram for device ${deviceData.name}`);
        }
        return success;
    } catch (error) {
        logger.error(`Error in sendRelayNotification: ${error.message}`);
        return false;
    }
}

export {
    sendOfflineNotification,
    sendOnlineNotification,
    sendRelayNotification,
    validateTelegramConfig,
    getDeviceData,
    sendTelegramMessage,
    formatNotificationMessage
};
