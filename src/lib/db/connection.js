import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../logger/logger.js';

dotenv.config();

logger.info("Creating connection pool to the database...");

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'botify_db',
    password: process.env.DB_PASSWORD || 'admin'
});

export { pool };
