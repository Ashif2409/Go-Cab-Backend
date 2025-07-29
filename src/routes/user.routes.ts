import express from 'express';
import { getProfile, loginUser, logoutUser, registerUser } from '../controllers/user.controller';
import { authUser } from '../middleware/auth.middleware';
const {body} = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    loginUser
)   

router.get('/profile',authUser,getProfile);

router.post('/logout', authUser, logoutUser);

export default router;
