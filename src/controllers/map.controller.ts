import { getAddressCoordinates, getAutoCompleteSuggestions, getDistanceAndTime } from '../service/maps.service';
import { Request, Response } from 'express';
const { validationResult } = require('express-validator');

export const getCoordinates = async (req:Request, res:Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { address } = req.query as { address: string };

    try {
        const coordinates = await getAddressCoordinates(address);
        return res.status(200).json(coordinates);
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
}

export const getDistTime = async (req:Request, res:Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { origin, destination } = req.query as { origin: string; destination: string };

    try {
        // Assuming you have a service function to get distance and time
        const distanceTime = await getDistanceAndTime(origin, destination);
        return res.status(200).json(distanceTime);
    } catch (error) {
        console.error('Error fetching distance and time:', error);
        return res.status(500).json({ error: 'Failed to fetch distance and time' });
    }
}

export const getAutoCompleteAddressSuggestion = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { input } = req.query as { input: string };
        const suggestions = await getAutoCompleteSuggestions(input);
        return res.status(200).json(suggestions);
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        return res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
    }
}
    