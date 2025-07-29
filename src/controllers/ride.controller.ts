import { getAddressCoordinates, getRiderInRadius } from "../service/maps.service";
import { confirmRide, createRide, endRide, getFare, startRide } from "../service/ride.service";
import { sendMessageToSocketId } from "../socket";
const {validationResult} = require('express-validator');
import { Request, Response } from 'express';


export const createRideController = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation, vehicleType } = req.body;
    if(!req.user || !req.user._id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        // Step 1: Create the ride
        const ride = await createRide(req.user, pickupLocation, dropoffLocation, vehicleType);

        // Step 2: Get pickup coordinates
        const pickupCoords = await getAddressCoordinates(pickupLocation);

        // Step 3: Find nearby drivers (within 5 km radius)
        const driversInRadius = await getRiderInRadius(pickupCoords.lat, pickupCoords.lng, 5);

        // Optional: remove sensitive data before broadcasting
        const rideDataForDriver = { ...ride.toObject(), OTP: undefined };

        // Step 4: Notify all nearby drivers
        await Promise.all(driversInRadius.map(driver => 
            sendMessageToSocketId(driver.socketId, {
                event: 'new-ride',
                data: rideDataForDriver
            })
        ));

        // Step 5: Respond to the client
        console.log(`Ride created with ID: ${ride._id}`);
        return res.status(201).json(ride);
        
    } catch (error) {
        console.error('Error creating ride:', error);
        return res.status(500).json({ error: 'Failed to create ride' });
    }
};

export const getFareController = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation } = req.query;
    if (typeof pickupLocation !== 'string' || typeof dropoffLocation !== 'string') {
        return res.status(400).json({ error: 'Invalid pickup or dropoff location' });
    }
    try {
        const fare = await getFare(pickupLocation, dropoffLocation);
        return res.status(200).json(fare);
    } catch (error) {
        console.error('Error fetching fare:', error);
        return res.status(500).json({ error: 'Failed to fetch fare' });
    }
};

export const confirmRideController = async (req: Request, res: Response) => {    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(!req.driver || !req.driver._id) {
        return res.status(401).json({ error: 'Driver not authenticated' });
    }
    if(!req.params || !req.params.rideId) {
        return res.status(400).json({ error: 'Ride ID is required' });
    }
    const { rideId } = req.params;

    try {
        const ride = await confirmRide(rideId,req.driver);
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        });
        return res.status(200).json(ride);
    } catch (error) {
        console.error('Error confirming ride:', error);
        return res.status(500).json({ error: 'Failed to confirm ride' });
    }
}

export const startRideController = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(!req.driver || !req.driver._id) {
        return res.status(401).json({ error: 'Driver not authenticated' });
    }
    const { rideId, OTP } = req.body;

    if (!rideId || !OTP) {
        return res.status(400).json({ error: 'Ride ID and OTP are required' });
    }

    try {
        const ride = await startRide(rideId, OTP, req.driver);
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        });
        return res.status(200).json(ride);
    } catch (error) {
        console.error('Error starting ride:', error);
        return res.status(500).json({ error: 'Failed to start ride' });
    }
}

export const endRideController = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(!req.driver || !req.driver._id) {
        return res.status(401).json({ error: 'Driver not authenticated' });
    }
    const { rideId } = req.body;

    if (!rideId) {
        return res.status(400).json({ error: 'Ride ID is required' });
    }

    try {
        const ride = await endRide(rideId, req.driver);
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (error) {
        console.error('Error ending ride:', error);
        return res.status(500).json({ error: 'Failed to end ride' });
    }
}