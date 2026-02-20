
import pool from './db';

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to Postgres!');
        client.release();
        process.exit(0);
    } catch (err: any) {
        console.error('Connection failed:', err.message);
        console.error('Code:', err.code);
        process.exit(1);
    }
}

testConnection();
