import { Schema, Types } from "mongoose";
import mongoose from "mongoose";
const riderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    driver: {
        type: Types.ObjectId,
        ref: 'Driver',
    },
    pickupLocation: {
        type: String,
        required: true
    },
    destination:{
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted','ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    duration: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String
    },
    OrderId: {
        type: String
    },
    signature: {
        type: String
    },
    OTP: {
        type: Number,
        required: true,
        select: false
    }, 
});

const Ride = mongoose.model('Ride', riderSchema);
export default Ride;