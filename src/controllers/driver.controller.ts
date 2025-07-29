import { Request, Response } from "express";
import Driver from "../models/driver/driver.model";
import { createDriver } from "../service/driver.service";
import BlacklistToken from "../models/blacklist_token/blacklist.model";
const { validationResult } =require("express-validator");

export const registerDriver = async (req:Request, res:Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, vehicle,status, location } = req.body;
    
    try {
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
        return res.status(400).json({ message: 'Driver already exists' });
        }
    
        const driver = await createDriver({
        name,
        email,
        password,
        vehicle,
        status,
        location
        });
    
        const token = driver.getAuthToken();
        res.cookie('token', token);
        res.status(201).json({
        message: 'Driver registered successfully',
        token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const loginDriver = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const driver = await Driver.findOne({ email }).select('+password');
        if (!driver || !(await driver.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = driver.getAuthToken();
        res.cookie('token', token);

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getDriverProfile = async (req: Request, res: Response) => {
    return res.status(200).json({
        message: 'Driver profile fetched successfully',
        driver: req.driver
    });
}

export const logoutDriver = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const blacklistToken = new BlacklistToken({ token });
        await blacklistToken.save();
        res.clearCookie('token');
        return res.status(200).json({
            message: 'Driver logged out successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}