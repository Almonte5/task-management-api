import {Request, Response} from 'express';
import pool from '../config/database';

export const createTask = async (req: Request, res: Response) => {
    try {
        const {title, description, status, priority, due_date} = req.body;
        const userId = req.user?.userId;
        
        if(!userId) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (!title) {
            return res.status(400).json({error: 'Title is required'});
        }

        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, title, description, status || 'todo', priority || 'medium', due_date]
        );
        
        res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });

    } catch (error) {
        console.error('Error creating Task:', error);
        res.status(500).json({error: 'Server error'})
    }
        
};