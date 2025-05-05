import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: any;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const decoded = await verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
