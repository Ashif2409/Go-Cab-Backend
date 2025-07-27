import { createRide } from "../service/ride.service";
const {validationResult} = require('express-validator');

export const createRideController = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    try {
        const ride = await createRide(req.user._id,pickupLocation, dropoffLocation,vehicleType);
        return res.status(201).json(ride);
    } catch (error) {
        console.error('Error creating ride:', error);
        return res.status(500).json({ error: 'Failed to create ride' });
    }
}