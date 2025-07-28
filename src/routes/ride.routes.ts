import express from 'express';
import { createRideController,getFareController } from '../controllers/ride.controller';
import { authUser } from '../middleware/auth.middleware';
const { body ,query} = require('express-validator');
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

router.get('/get-fare',
    authUser,
    [
        query('pickupLocation').notEmpty().withMessage('Pickup location is required'),
        query('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
    ],
    getFareController
)
export default router;