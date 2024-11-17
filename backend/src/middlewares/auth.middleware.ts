import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface AuthRequest extends Request {
  user?: { userId: string; role: Role };
}

export const authMiddleware = (roles: Role[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: Role };
      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error('Insufficient permissions');
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };
};