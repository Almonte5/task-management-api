import express from 'express';
import { createTask, getTasks, getTaskById } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.get('/:id', authMiddleware, getTaskById);

export default router;