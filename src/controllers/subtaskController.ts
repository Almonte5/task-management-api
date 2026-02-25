import { Request, Response } from 'express';
import pool from '../config/database';

export const createSubtask = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const { title } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const taskCheck = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, userId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const result = await pool.query(
            'INSERT INTO subtasks (task_id, title) VALUES ($1, $2) RETURNING *',
            [taskId, title]
        );

        res.status(201).json({
            message: 'Subtask created successfully',
            subtask: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating subtask:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getSubtasks = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify task belongs to user
        const taskCheck = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, userId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const result = await pool.query(
            'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
            [taskId]
        );

        res.status(200).json({ subtasks: result.rows });
    } catch (error) {
        console.error("Error fetching subtasks:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const toggleSubtask = async (req: Request, res: Response) => {
    try {
        const subtaskId = req.params.id;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const ownershipCheck = await pool.query(
            `SELECT s.* FROM subtasks s
             JOIN tasks t ON s.task_id = t.id
             WHERE s.id = $1 AND t.user_id = $2`,
            [subtaskId, userId]
        );

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        const result = await pool.query(
            'UPDATE subtasks SET completed = NOT completed WHERE id = $1 RETURNING *',
            [subtaskId]
        );

        res.status(200).json({
            message: 'Subtask toggled successfully',
            subtask: result.rows[0]
        });
    } catch (error) {
        console.error("Error toggling subtask:", error);
        res.status(500).json({ error: 'Server error' });
    }
};