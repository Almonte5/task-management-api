import { Request, Response } from 'express';
import pool from '../config/database';

export const createSubtask = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const title = req.body.title;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!taskId){
            return res.status(401).json({ error: 'Task ID is required' });
        }

        const result = await pool.query(
            'INSERT INTO subtasks (task_id, title) VALUES ($1, $2) RETURNING *',
            [taskId, title]
        );

        res.status(201).json({
            message: 'Subtask created successfully',
            subtask: result.rows[0]
        });
    }catch (error) {
        console.error("Error creating subtask:", error);
        res.status(500).json({ error: 'Server error' });
    }
};


