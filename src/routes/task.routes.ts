import express from 'express';
import { createTask } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createTask);

export default router;