import express from 'express';
import { createTask, getTasks } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);

export default router;