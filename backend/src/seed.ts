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

async function seed() {
    const client = await pool.connect();
    try {
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
            console.log(`  ✅ User "${user.username}" (${user.role}) — password: ${user.password}`);
        }
        console.log('\n🎉 Seeding complete!');
        console.log('\n📋 Login credentials:');
        console.log('  Director:     director    / Atfitk@Dir2024!');
        console.log('  Psychologist: psychologist / Psy#Atfitk2024!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(() => process.exit(1));
