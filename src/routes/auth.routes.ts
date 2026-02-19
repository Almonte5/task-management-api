import express from 'express';
import { register, login, getMe, forgotPassword } from '../controllers/authController'
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe)
router.post('/forgot-password', forgotPassword);

export default router;