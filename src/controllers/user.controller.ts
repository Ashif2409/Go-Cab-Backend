import BlacklistToken from '../models/blacklist_token/blacklist.model';
import User from '../models/user/user.model';
import { createUser } from '../service/user.service';
import { Request, Response } from 'express';
const {  validationResult } = require('express-validator');

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const user = await createUser({
      name,
      email,
      password
    });
    if (!user) {
      return res.status(400).json({ message: 'User already exists' });
    }    
    const token = user.getAuthToken();
    
    res.status(201).json({
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const loginUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = user.getAuthToken();
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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user=req.user;
   return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Add token to blacklist
    await BlacklistToken.create({ token });

    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}