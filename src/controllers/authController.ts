import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import jwt from 'jsonwebtoken';

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