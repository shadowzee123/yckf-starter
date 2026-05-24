// src/middlewares/requireRole.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Minimal typed user shape attached to request
 */
export interface AuthUser {
  id: string;
  role?: string | null;
}
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * requireRole(allowedRoles) middleware factory
 */
export default function requireRole(allowedRoles: string[] = []) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const token = authHeader.split(' ')[1];

      let payload: any;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.warn('requireRole: invalid token', err);
        return res.status(401).json({ message: 'Invalid token' });
      }

      const userId: string | undefined = payload.userId || payload.sub || undefined;
      const roleFromToken: string | undefined = payload.role || payload.roleId || undefined;

      if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

      req.user = { id: userId, role: roleFromToken };

      // If no roles required, allow authenticated user
      if (allowedRoles.length === 0) return next();

      // If role present in token and allowed, pass
      if (roleFromToken && allowedRoles.includes(roleFromToken)) {
        return next();
      }

      // Fallback: fetch user's role from DB and check it
      const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
      const actualRole = user?.role?.name;
      if (actualRole && allowedRoles.includes(actualRole)) {
        req.user = { id: userId, role: actualRole };
        return next();
      }

      return res.status(403).json({ message: 'Forbidden' });
    } catch (e) {
      console.error('requireRole error:', e);
      return res.status(500).json({ message: 'Server error' });
    }
  };
}
