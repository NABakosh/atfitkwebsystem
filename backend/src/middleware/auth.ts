import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
        displayName: string;
    };
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET!;

    try {
        const decoded = jwt.verify(token, secret) as {
            id: number;
            username: string;
            role: string;
            displayName: string;
        };
        (req as AuthRequest).user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

export function requireDirector(req: Request, res: Response, next: NextFunction): void {
    const authReq = req as AuthRequest;
    if (authReq.user?.role !== 'director') {
        res.status(403).json({ error: 'Forbidden: Director role required' });
        return;
    }
    next();
}
