import express from 'express';
import { createSubtask, getSubtasks, toggleSubtask } from '../controllers/subtaskController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/:id/subtasks', authMiddleware, createSubtask);
router.get('/:id/subtasks', authMiddleware, getSubtasks);
router.put('/subtasks/:id/toggle', authMiddleware, toggleSubtask)

export default router;