import { Router, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || './uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config: store files with unique names
const storage: StorageEngine = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) => {
        cb(null, uploadsDir);
    },
    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
        }
    },
});

// POST /api/students/:id/photo
router.post('/:id/photo', authenticate, upload.single('photo'), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'No photo file provided' });
        return;
    }

    try {
        // Get old photo to delete
        const existing = await pool.query('SELECT photo_path FROM students WHERE id = $1', [req.params.id]);
        if (!existing.rows[0]) {
            fs.unlinkSync(req.file.path);
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        // Delete old photo if exists
        if (existing.rows[0].photo_path) {
            const oldPath = path.join(uploadsDir, existing.rows[0].photo_path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update student's photo_path in DB (only filename)
        await pool.query(
            'UPDATE students SET photo_path = $1, updated_at = NOW() WHERE id = $2',
            [req.file.filename, req.params.id]
        );

        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        const photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
        res.json({ photo: photoUrl, filename: req.file.filename });
    } catch (error) {
        console.error('Photo upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// DELETE /api/students/:id/photo
router.delete('/:id/photo', authenticate, async (req: Request, res: Response) => {
    try {
        const existing = await pool.query('SELECT photo_path FROM students WHERE id = $1', [req.params.id]);
        if (!existing.rows[0]) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        if (existing.rows[0].photo_path) {
            const filePath = path.join(uploadsDir, existing.rows[0].photo_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await pool.query('UPDATE students SET photo_path = NULL, updated_at = NOW() WHERE id = $1', [req.params.id]);
        }

        res.json({ message: 'Photo deleted' });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

export { uploadsDir };
export default router;
