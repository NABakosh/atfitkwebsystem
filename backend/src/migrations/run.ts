import fs from 'fs';
import path from 'path';
import pool from '../db';

async function runMigrations() {
    const client = await pool.connect();
    try {
        const sqlPath = path.join(__dirname, '001_init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        console.log('🔄 Running migrations...');
        await client.query(sql);
        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch(() => process.exit(1));
