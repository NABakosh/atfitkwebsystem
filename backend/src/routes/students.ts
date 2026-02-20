import { Router, Request, Response } from 'express';
import { authenticate, requireDirector, AuthRequest } from '../middleware/auth';
import pool from '../db';

const router = Router();

// Helper to map DB row to Student type
function mapStudent(row: Record<string, unknown>) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return {
        id: row.id,
        fullName: row.full_name,
        birthDate: row.birth_date || '',
        group: row.group_name || '',
        iin: row.iin || '',
        previousSchool: row.previous_school || '',
        specialty: row.specialty || '',
        course: row.course || '',
        address: row.address || '',
        phone: row.phone || '',
        photo: row.photo_path
            ? `${baseUrl}/uploads/${row.photo_path}`
            : '',
        family: row.family,
        internalRegistry: row.internal_registry,
        policeRegistry: row.police_registry,
        consultations: row.consultations,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// GET /api/students
router.get('/', authenticate, async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students ORDER BY created_at DESC'
        );
        res.json(result.rows.map(mapStudent));
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students WHERE id = $1',
            [req.params.id]
        );
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json(mapStudent(result.rows[0]));
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// POST /api/students
router.post('/', authenticate, async (req: Request, res: Response) => {
    const {
        fullName, birthDate, group, iin, previousSchool, specialty,
        course, address, phone, family, internalRegistry, policeRegistry, consultations
    } = req.body;

    if (!fullName) {
        res.status(400).json({ error: 'fullName is required' });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO students (
                full_name, birth_date, group_name, iin, previous_school, specialty,
                course, address, phone, family, internal_registry, police_registry, consultations
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *`,
            [
                fullName,
                birthDate || '',
                group || '',
                iin || '',
                previousSchool || '',
                specialty || '',
                course || '',
                address || '',
                phone || '',
                JSON.stringify(family || {}),
                JSON.stringify(internalRegistry || {}),
                JSON.stringify(policeRegistry || { isRegistered: false }),
                JSON.stringify(consultations || []),
            ]
        );
        res.status(201).json(mapStudent(result.rows[0]));
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// PUT /api/students/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    const {
        fullName, birthDate, group, iin, previousSchool, specialty,
        course, address, phone, family, internalRegistry, policeRegistry, consultations
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE students SET
                full_name = $1, birth_date = $2, group_name = $3, iin = $4,
                previous_school = $5, specialty = $6, course = $7, address = $8,
                phone = $9, family = $10, internal_registry = $11,
                police_registry = $12, consultations = $13, updated_at = NOW()
            WHERE id = $14
            RETURNING *`,
            [
                fullName,
                birthDate || '',
                group || '',
                iin || '',
                previousSchool || '',
                specialty || '',
                course || '',
                address || '',
                phone || '',
                JSON.stringify(family || {}),
                JSON.stringify(internalRegistry || {}),
                JSON.stringify(policeRegistry || { isRegistered: false }),
                JSON.stringify(consultations || []),
                req.params.id,
            ]
        );
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json(mapStudent(result.rows[0]));
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// DELETE /api/students/:id — only director
router.delete('/:id', authenticate, requireDirector, async (req: Request, res: Response) => {
    try {
        const existing = await pool.query('SELECT photo_path FROM students WHERE id = $1', [req.params.id]);
        if (!existing.rows[0]) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        // Delete photo file if exists
        if (existing.rows[0].photo_path) {
            const fs = await import('fs');
            const path = await import('path');
            const uploadsDir = path.resolve(process.env.UPLOADS_DIR || './uploads');
            const filePath = path.join(uploadsDir, existing.rows[0].photo_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Re-export AuthRequest for use in other files
export { AuthRequest };
export default router;
