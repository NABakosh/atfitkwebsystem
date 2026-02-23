import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import photoRoutes from './routes/photos';
import { runMigrations } from './migrations/run';
import { seedUsers } from './seed';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || './uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS — allow frontend origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://atfitk-websystem.vercel.app',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Allow any vercel.app subdomain
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        // Allow any custom domain set via FRONTEND_URL env var (supports https://)
        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl && origin === frontendUrl) {
            return callback(null, true);
        }
        return callback(new Error(`CORS error: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos as static files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/students', photoRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, async () => {
    try {
        await runMigrations();
        await seedUsers();
    } catch (err) {
        console.error('Failed to run startup scripts:', err);
    }

    console.log(`\n🚀 ATFITK Backend API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Photos: http://localhost:${PORT}/uploads/`);
    console.log(`\n📋 Accounts:`);
    console.log(`   Director:     director    / Atfitk@Dir2024!`);
    console.log(`   Psychologist: psychologist / Psy#Atfitk2024!\n`);
});

export default app;
