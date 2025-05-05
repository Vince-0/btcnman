import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login as any);
router.post('/register', register as any);

export default router;
