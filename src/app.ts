import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { connectDB } from './db/db_connection';
import userRoutes from './routes/user.routes';
import driverRoutes from './routes/driver.routes';
import mapRoutes from './routes/map.routes';
import rideRoutes from './routes/ride.routes';

// Connect to MongoDB
connectDB();
// Initialize Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/rides', rideRoutes);

app.get('/', (req:Request, res:Response) => {
    res.send('Hello World!');
});

export default app;