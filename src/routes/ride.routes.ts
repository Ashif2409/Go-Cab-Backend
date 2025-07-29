import express from 'express';
import { confirmRideController, createRideController,getFareController,startRideController,endRideController } from '../controllers/ride.controller';
import { authDriver, authUser } from '../middleware/auth.middleware';
const { body ,query} = require('express-validator');
const router = express.Router();

router.post('/create-ride',
    authDriver,
    [
        body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
        body('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
        body('vehicleType').isIn(['car', 'bike', 'auto']).withMessage('Vehicle type must be car, bike, or auto'),
    ],
    createRideController
)

router.get('/get-fare',
    authDriver,
    [
        query('pickupLocation').notEmpty().withMessage('Pickup location is required'),
        query('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
    ],
    getFareController
)

router.post('/confirm-ride/:rideId',
    authDriver,
    confirmRideController
);

router.post('/ride-start',
    authDriver,
    [
        body('rideId').notEmpty().withMessage('Ride ID is required'),
        body('OTP').notEmpty().withMessage('OTP is required'),
    ],
    startRideController
)

router.post('/ride-end',
    authDriver,
    [
        body('rideId').isMongoId().withMessage('Ride ID is required'),
    ],
    endRideController
);
export default router;