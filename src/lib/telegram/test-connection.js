import dotenv from 'dotenv';
import logger from '../logger/logger.js';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`;

/**
 * Test koneksi ke Telegram API
 */
async function testTelegramConnection() {
    const startTime = Date.now();
    
    try {
        if (!TELEGRAM_TOKEN) {
            logger.warn("Telegram token not configured.", "TELEGRAM");
            return false;
        }

        logger.info("Testing Telegram API connection...", "TELEGRAM");
        
        const response = await fetch(TELEGRAM_API_URL);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
            logger.error(`Telegram connection failed: ${response.statusText}`, "TELEGRAM");
            return false;
        }

        const data = await response.json();
        
        if (data.ok) {
            const botUsername = data.result.username;
            logger.success(`Telegram Bot Connected: @${botUsername}`, "TELEGRAM");
            
            // Print section with telegram info
            logger.printSection('TELEGRAM BOT INFO', [
                { 'Bot Username': `@${botUsername}` },
                { 'Bot ID': data.result.id },
                { 'Response Time': `${responseTime}ms` },
                { 'API Status': 'Connected ✓' }
            ]);
            
            return true;
        } else {
            logger.error(`Telegram API error: ${data.description}`, "TELEGRAM");
            return false;
        }
    } catch (error) {
        logger.error(`Error testing Telegram connection: ${error.message}`, "TELEGRAM");
        return false;
    }
}

export default testTelegramConnection;
