import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/db_connection';

dotenv.config();

// Connect to MongoDB
connectDB();
// Initialize Express app
const app = express();
app.get('/', (req:Request, res:Response) => {
    res.send('Hello World!');
});

export default app;