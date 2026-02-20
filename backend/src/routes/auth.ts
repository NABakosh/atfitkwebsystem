import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            displayName: user.display_name,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.json({
            token,
            user: payload,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
});

export default router;
