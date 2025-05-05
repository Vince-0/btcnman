import { Request, Response, NextFunction } from 'express';
import { validateUser, generateToken, createUser } from '../services/auth.service';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    const user = await validateUser(username, password);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
    return;
    }

    // Check if username already exists
    const existingUser = await validateUser(username, password);
    if (existingUser) {
      res.status(409).json({ message: 'Username already exists' });
    return;
    }

    const user = await createUser(username, password);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username
      }
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}
