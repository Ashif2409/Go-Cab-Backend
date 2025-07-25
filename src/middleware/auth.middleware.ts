import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User from "../models/user/user.model";
import BlacklistToken from "../models/blacklist_token/blacklist.model";

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                name: {
                    firstName: string;
                    lastName: string;
                };
                email: string;
                socketId?: string | null;
            };
        }
    }
}

export const authUser = async(req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const isTokenBlacklisted = await BlacklistToken.find({ token }).exec();
    if (isTokenBlacklisted.length > 0) {
        return res.status(401).json({ message: 'Token is blacklisted, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        let user;
        if (typeof decoded === "object" && "_id" in decoded) {
            user = await User.findById(decoded._id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            if(user._id && user.name && user.email) {
            req.user = {
                _id: user._id.toString(),
                name: {
                    firstName: user.name.firstName,
                    lastName: user.name.lastName || ''
                },
                email: user.email,
                socketId: user.socketId ?? null
            };
            next();
        } else {
            return res.status(401).json({ message: 'Token payload invalid' });
        }
    }
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
}