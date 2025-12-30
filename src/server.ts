import express, {Express, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// environmental variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;




