import express from 'express';
import { getDriverProfile, loginDriver, registerDriver, logoutDriver } from '../controllers/driver.controller';
import { authDriver } from '../middleware/auth.middleware';
const {body} = require('express-validator');
const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('vehicle.color').notEmpty().withMessage('Vehicle color is required'),
    body('vehicle.plate').notEmpty().withMessage('Vehicle plate is required'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Vehicle capacity must be at least 1'),
    body('vehicle.vehicleType').isIn(['car', 'bike', 'auto']).withMessage('Vehicle type must be car, bike, or auto'),
    body('location.lat').isFloat().withMessage('Latitude must be a valid number'),
    body('location.lng').isFloat().withMessage('Longitude must be a valid number'),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  ],
    registerDriver
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginDriver
);

router.get('/profile', authDriver, getDriverProfile);

router.post('/logout',authDriver, logoutDriver);
export default router;