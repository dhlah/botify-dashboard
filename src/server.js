import express from 'express';
import { createServer } from 'node:http';
import logger from './lib/logger/logger.js';
import { deviceMonitor, systemMonitor } from './lib/logger/index.js';
import path from 'path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { startBroker, setSocketIO } from './broker.js';
import deviceRoutes from './routes/deviceRoutes.js';
import bodyParser from 'body-parser';
import os from 'os';
import testConnectionToTelegram from './services/testing-telegram-connection.js';
import CLIHandler from './lib/cli/cli-handler.js';
import getAllDevices from './functions/get-all-device.js';

dotenv.config();

// Print Botify Service Banner
logger.printBanner();

// Print logging configuration
logger.printLoggingConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Socket.io connection
io.on('connection', (socket) => {
    logger.debug(`Client connected: ${socket.id}`, "SOCKET.IO");

    // Client join room for device status
    socket.on('join-device', (deviceId) => {
        socket.join(`${deviceId}/status`);
        logger.debug(`Client joined room: ${deviceId}/status`, "SOCKET.IO");
    });
    
    // Join logs room for real-time updates
    socket.on('join-device-logs', (deviceId) => {
        socket.join(`${deviceId}/logs`);
        logger.debug(`Client joined logs room: ${deviceId}/logs`, "SOCKET.IO");
    });

    socket.on('leave-device', (deviceId) => {
        socket.leave(`${deviceId}/status`);
        logger.debug(`Client left room: ${deviceId}/status`, "SOCKET.IO");
    });
    
    socket.on('leave-device-logs', (deviceId) => {
        socket.leave(`${deviceId}/logs`);
        logger.debug(`Client left logs room: ${deviceId}/logs`, "SOCKET.IO");
    });

    socket.on('disconnect', () => {
        logger.debug(`Client disconnected: ${socket.id}`, "SOCKET.IO");
    });
});

// Set socket.io instance to broker
setSocketIO(io);

// Routes
app.use('/', deviceRoutes);

// Start MQTT Broker
logger.info("Starting MQTT Broker...", "STARTUP");
startBroker();

logger.info("Testing Telegram connection...", "STARTUP");
testConnectionToTelegram();

// Delay CLI start to allow Telegram initialization
setTimeout(() => {
    // CLI will start after initialization completes
    global.CLI_READY = true;
}, 1000);

server.listen(process.env.API_PORT, () => {
    const interfaces = os.networkInterfaces();
    let ipAddress = 'localhost';
    
    // Get the first available IPv4 address
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddress = iface.address;
                break;
            }
        }
        if (ipAddress !== 'localhost') break;
    }
    
    // Print system info
    logger.printSystemInfo({
        serverUrl: process.env.BASE_URL || `http://${ipAddress}`,
        apiPort: process.env.API_PORT || 3000,
        mqttPort: process.env.MQTT_PORT || 1883,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        machineIp: ipAddress
    });
    
    logger.success(`Server is running on ${process.env.BASE_URL || `http://${ipAddress}`}:${process.env.API_PORT}`, "SERVER");
    logger.success(`Machine IP Address: ${ipAddress}`, "SERVER");
    logger.printMonitoringMetrics();
    
    // Wait for Telegram initialization to complete before starting CLI
    const startCLI = setInterval(() => {
        if (global.CLI_READY) {
            clearInterval(startCLI);
            
            // Small delay to ensure telegram output is shown
            setTimeout(() => {
                logger.info("Starting CLI Console...", "STARTUP");
                console.log(''); // Add blank line for visual separation
                
                // Create device adapter that wraps database getAllDevices
                const deviceAdapter = {
                    getAllDevices: async () => {
                        try {
                            return await getAllDevices();
                        } catch (err) {
                            logger.warn(`Failed to fetch devices for CLI: ${err.message}`, 'CLI');
                            return [];
                        }
                    }
                };
                
                const cliHandler = new CLIHandler(logger, deviceAdapter, systemMonitor);
                cliHandler.start();
            }, 500);
        }
    }, 100);
});