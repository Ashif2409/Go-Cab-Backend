import { Request, Response } from "express";
import Driver from "../models/driver/driver.model";
import { createDriver } from "../service/driver.service";
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