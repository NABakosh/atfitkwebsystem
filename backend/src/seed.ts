import bcrypt from 'bcryptjs';
import pool from './db';

const USERS = [
    {
        username: 'director',
        password: 'Atfitk@Dir2024!',
        role: 'director',
        display_name: 'Заместитель директора',
    },
    {
        username: 'psychologist',
        password: 'Psy#Atfitk2024!',
        role: 'psychologist',
        display_name: 'Психолог',
    },
];

export async function seedUsers() {
    const client = await pool.connect();
    try {
        // Check if users already exist
        const res = await client.query('SELECT count(*) FROM users');
        const count = parseInt(res.rows[0].count, 10);
        if (count > 0) {
            console.log('✅ Users already exist, skipping seed.');
            return;
        }

        console.log('🌱 Seeding users...');
        for (const user of USERS) {
            const hash = await bcrypt.hash(user.password, 12);
            await client.query(
                `INSERT INTO users (username, password_hash, role, display_name)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO UPDATE SET
                   password_hash = EXCLUDED.password_hash,
                   role = EXCLUDED.role,
                   display_name = EXCLUDED.display_name,
                   updated_at = NOW()`,
                [user.username, hash, user.role, user.display_name]
            );
            console.log(`  ✅ User "${user.username}" (${user.role}) created`);
        }
        console.log('🎉 Seeding complete!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run immediately only if executed directly (not imported)
if (require.main === module) {
    seedUsers()
        .then(() => pool.end())
        .catch(() => process.exit(1));
}
