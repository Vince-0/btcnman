import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function validateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;
  
  return user;
}

export function generateToken(user: any): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function verifyToken(token: string): Promise<any> {
  return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function createUser(username: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      username,
      password: hashedPassword
    }
  });
}
