import express from 'express';
import { createRideController } from '../controllers/ride.controller';
import { authUser } from '../middleware/auth.middleware';
const { body } = require('express-validator');
const router = express.Router();

router.post('/create-ride',
    authUser,
    [
        body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
        body('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
        body('vehicleType').isIn(['car', 'bike', 'auto']).withMessage('Vehicle type must be car, bike, or auto'),
    ],
    createRideController
)

export default router;