import { createServer } from 'node:net';
import Aedes from 'aedes';
import logger from './lib/logger/logger.js';
import dotenv from 'dotenv';
import updateDeviceStatus from './functions/update-status-device.js';
import saveValueToDatabase from './functions/save-value-to-database.js';
import sendRelayNotificationToTelegram from './services/send-relay-notification-to-telegram.js';
import sendDeviceOfflineNotificationToTelegram from './services/send-offline-notification-to-telegram.js';
import sendDeviceOnlineNotificationToTelegram from './services/send-online-notification-to-telegram.js';

dotenv.config();

const aedes = Aedes();
const AedesServer = createServer(aedes.handle);
let io = null;

// Store device IP addresses when clients connect
const deviceIpMap = new Map();

// Helper: Format datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
function formatMySQLDateTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Aedes Authentication
aedes.authenticate = (client, username, password, callback) => {
    import('./functions/authenticate-devices.js').then(({ default: AuthenticateDevice }) => {
        AuthenticateDevice(client, username, password, callback);
    }).catch(error => {
        logger.error(`Failed to load authentication module: ${error.message}`);
        const err = new Error('Authentication module load failed');
        callback(err, false);
    });
};

// Track device client connections and capture IP address
aedes.on('client', (client) => {
    if (client && client.id) {
        // Get IP from socket.remoteAddress or fallback to 0.0.0.0
        const deviceIp = client.conn?.remoteAddress || '0.0.0.0';
        deviceIpMap.set(client.id, deviceIp);
        logger.debug(`Device ${client.id} connected from IP: ${deviceIp}`, "MQTT-CLIENT");
    }
});

// Clean up device IP on disconnect
aedes.on('clientDisconnect', (client) => {
    if (client && client.id) {
        deviceIpMap.delete(client.id);
        logger.debug(`Device ${client.id} disconnected and IP removed`, "MQTT-CLIENT");
    }
});

async function pingDeviceStatus(clientId, status, timestamp = null) {
    if (status === 'offline') {
        logger.warn(`Device ${clientId} disconnected`, "MQTT-DEVICE");
        const disconnectTime = formatMySQLDateTime();
        updateDeviceStatus(clientId, 'offline', disconnectTime);
        saveValueToDatabase(clientId, 'offline');
        await sendDeviceOfflineNotificationToTelegram(clientId);
        if (io) {
            io.to(`${clientId}/status`).emit(`${clientId}/device-status`, {
                deviceId: clientId,
                status: 'offline',
                timestamp: new Date()
            });
            io.to(`${clientId}/logs`).emit(`${clientId}/new-log`, {
                value: 'offline',
                timestamp: new Date()
            });
        }
    } else if (status === 'online') {
        logger.success(`Device ${clientId} connected`, "MQTT-DEVICE");
        updateDeviceStatus(clientId, 'online', new Date().toISOString());
        saveValueToDatabase(clientId, 'online');
        await sendDeviceOnlineNotificationToTelegram(clientId);
        if (io) {
            io.to(`${clientId}/status`).emit(`${clientId}/device-status`, {
                deviceId: clientId,
                status: 'online',
                timestamp: new Date()
            });
            io.to(`${clientId}/logs`).emit(`${clientId}/new-log`, {
                value: 'online',
                timestamp: new Date()
            });
        }
    }
}


// Handle published messages
aedes.on('publish', async (packet, client) => {
    if (!client || !packet.topic) return;
    const topicParts = packet.topic.split('/');
    const clientId = topicParts[0];

    if (packet.topic === `${clientId}/status`) {
        logger.info(`Status update from ${clientId}: ${packet.payload.toString()}`, "MQTT-PUBLISH");
        pingDeviceStatus(clientId, packet.payload.toString());
        return;
    }

    if (packet.topic === `${clientId}/heartbeat`) {
        // Handle heartbeat message (contains temperature from ESP)
        logger.debug(`Heartbeat from ${clientId}: ${packet.payload.toString()}`, "MQTT-HEARTBEAT");
        
        try {
            const temperature = parseFloat(packet.payload.toString());
            const deviceIp = deviceIpMap.get(clientId) || 'Unknown';
            
            if (io) {
                io.to(`${clientId}/status`).emit(`${clientId}/heartbeat`, {
                    deviceId: clientId,
                    temperature: temperature,
                    deviceIp: deviceIp,
                    timestamp: new Date()
                });
                logger.debug(`Emitted heartbeat to ${clientId}: temp=${temperature}°C, ip=${deviceIp}`, "MQTT-HEARTBEAT");
            }
        } catch (err) {
            logger.warn(`Failed to parse heartbeat temperature for ${clientId}:`, err.message);
        }
        return;
    }

    if (!packet.topic.includes('/value')) {
        logger.warn(`Message from ${clientId} on topic ${packet.topic} is not a value message`);
        return;
    }

    try {
        const payloadStr = packet.payload.toString();
        logger.debug(`Message from ${clientId} on topic ${packet.topic}: ${payloadStr}`);

        let data;
        try {
            data = JSON.parse(payloadStr);
        } catch {
            logger.warn("Payload bukan JSON, dilewati");
            return;
        }
        logger.debug(`Parsed data from ${clientId}: ${JSON.stringify(data)}`);

        // Simpan nilai ke database
        const saved = await saveValueToDatabase(
            clientId,
            data.switch
        );

        // Emit realtime status tetap jalan
        if (io) {

            io.to(`${clientId}/status`).emit(`${clientId}/value`, {
                values: data,
                timestamp: new Date()
            });

            // hanya kirim log jika data benar-benar disimpan
            if (saved) {
                io.to(`${clientId}/logs`).emit(`${clientId}/new-log`, {
                    value: data.switch,
                    timestamp: new Date()
                });
                sendRelayNotificationToTelegram(clientId, data.switch);
            }

            logger.debug(`Emitted value update to ${clientId}`);
        }

    } catch (err) {
        logger.error("Publish handler error:", err);
    }
});


export function startBroker() {
    const host = process.env.AEDES_HOST || '0.0.0.0';

    AedesServer.listen(process.env.AEDES_PORT, () => {
        logger.info(
            `Aedes MQTT broker started and listening on mqtt://${host}:${process.env.AEDES_PORT}`
        );
    });
}

export function setSocketIO(socketIoInstance) {
    io = socketIoInstance;
}

export { aedes, AedesServer };
