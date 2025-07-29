import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IUser } from "./user.interface";
import e from "express";
const userSchema = new mongoose.Schema({
  name: {
        firstName: {
        type: String, 
        required: true,
        minlength: [2,'First name must be at least 2 characters long'],
        },
        lastName: {
        type: String, 
        minlength: [2,'Last name must be at least 2 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId:{
        type: String,
        default: null
    }
})

// Add getAuthToken method to userSchema
userSchema.methods.getAuthToken = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string") {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign({ _id: this._id}, secret,{expiresIn: '24h'});
};

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword:string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

 const User= mongoose.model<IUser>('User', userSchema);
 export = User;