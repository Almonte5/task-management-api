import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
            [email, hashedPassword, name]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body

        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({error: 'Invalid Credentials'});
        }

        const foundUser = user.rows[0];

        const isValidPassword = await bcrypt.compare(password, foundUser.password_hash);
        if(!isValidPassword) {
            return res.status(401).json({error: 'Invalid Credentials'});
        }
        const token = jwt.sign(
            { userId: foundUser.id, email: foundUser.email },  // payload
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login Successful',
            token: token,
            user: {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            }
        });
        } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }

};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            ' SELECT id, email, name, created_at FROM users WHERE id = $1',
            [userId]
        )
        res.status(200).json({ user: result.rows[0] });
    }catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000);
        
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [token, expires, email]
        )

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail(email, 'Password Reset', `Click here to reset your password: ${resetLink}`);

        res.json({ message: 'Password reset email sent' });

    }catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        const userResult = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        )
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
            [hashedPassword, token]
        )
        res.json({ message: 'Password reset successful' });

    }catch (error){
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};