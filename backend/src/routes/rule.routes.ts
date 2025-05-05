import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as ruleController from '../controllers/rule.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate as any);

// Rule CRUD endpoints
router.get('/', ruleController.getAllRules as any);
router.get('/:id', ruleController.getRuleById as any);
router.post('/', ruleController.createRule as any);
router.put('/:id', ruleController.updateRule as any);
router.delete('/:id', ruleController.deleteRule as any);

// Rule execution endpoints
router.post('/:id/execute', ruleController.executeRule as any);
router.post('/execute-all', ruleController.executeAllRules as any);

// Rule logs endpoint
router.get('/logs', ruleController.getRuleLogs as any);

export default router;
