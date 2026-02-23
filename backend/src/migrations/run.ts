import fs from 'fs';
import path from 'path';
import pool from '../db';

export async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log('🔄 Running migrations...');
        const migrationsDir = path.join(__dirname);
        const sqlFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
        for (const file of sqlFiles) {
            const sqlPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(sqlPath, 'utf-8');
            console.log(`   ▶ ${file}`);
            await client.query(sql);
        }
        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run immediately only if executed directly (not imported)
if (require.main === module) {
    runMigrations()
        .then(() => pool.end())
        .catch(() => process.exit(1));
}
