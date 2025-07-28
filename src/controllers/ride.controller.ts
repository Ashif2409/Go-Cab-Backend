import { createRide, getFare } from "../service/ride.service";
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

export const getFareController = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation } = req.query;

    try {
        const fare = await getFare(pickupLocation, dropoffLocation);
        return res.status(200).json(fare);
    } catch (error) {
        console.error('Error fetching fare:', error);
        return res.status(500).json({ error: 'Failed to fetch fare' });
    }
}