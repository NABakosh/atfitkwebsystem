
import pool from './db';

async function check() {
    try {
        console.log('Checking database state...');

        // 1. Check DB name
        const dbNameRes = await pool.query('SELECT current_database()');
        console.log('Current database:', dbNameRes.rows[0].current_database);

        // 2. Check users table
        const tableRes = await pool.query(`
            SELECT exists (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'users'
            );
        `);
        console.log('Users table exists:', tableRes.rows[0].exists);

        // 3. Count users
        if (tableRes.rows[0].exists) {
            const countRes = await pool.query('SELECT count(*) FROM users');
            console.log('Users count:', countRes.rows[0].count);
        } else {
            console.log('Table users NOT found!');
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

check();
