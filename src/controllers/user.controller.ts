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