import Ride from "../models/ride/ride.model";
import { IUser } from "../models/user/user.interface";
import { sendMessageToSocketId } from "../socket";
import { getDistanceAndTime } from "./maps.service";
import crypto from "crypto";


function createOTP(num:Number): number {
    // Use crypto for secure random OTP generation
    const otp = parseInt(crypto.randomInt(100000, 1000000).toString(), 10);
    return otp;

}
export const createRide = async (
    user: any,
    pickupLocation: string,
    destination: string,
    vehicleType: string,
) => {
   if(!pickupLocation || !destination || !vehicleType || !user) {
        throw new Error('Pickup location, destination, vehicle type and user ID are required to create a ride');
    }
    const fare = await getFare(pickupLocation, destination);  

    if (!['auto', 'bike', 'car'].includes(vehicleType)) {
        throw new Error('Invalid vehicle type. Must be one of: auto, bike, car');
    }

    const ride =await Ride.create({
        user,
        pickupLocation,
        destination,
        fare: fare[vehicleType as 'auto' | 'bike' | 'car'],
        OTP: createOTP(6),
        status: 'pending',
        duration: fare.durationMin,
        distance: fare.distanceKm
    })
    return ride;
}

export async function getFare(pickup: string, destination: string): Promise<{ auto: number; bike: number; car: number, distanceKm: number, durationMin: number }> {
  const { distance, duration } = await getDistanceAndTime(pickup, destination);
    // Remove non-numeric characters and convert to SI units (meters, seconds)
    const distanceValue = parseFloat(distance.replace(/[^\d.]/g, ''));
    const durationValue = parseFloat(duration.replace(/[^\d.]/g, ''));

    let distanceMeters = distanceValue;
    let durationSeconds = durationValue;

    // If distance contains 'km', convert to meters
    if (distance.toLowerCase().includes('km')) {
        distanceMeters = distanceValue * 1000;
    } else if (distance.toLowerCase().includes('m')) {
        distanceMeters = distanceValue;
    }

    // If duration contains 'min', convert to seconds
    if (duration.toLowerCase().includes('min')) {
        durationSeconds = durationValue * 60;
    } else if (duration.toLowerCase().includes('s')) {
        durationSeconds = durationValue;
    }

    const distanceKm = Number(distanceMeters) / 1000;
    const durationMin = Number(durationSeconds) / 60;

    const autoRatePerKm = 10;
    const bikeRatePerKm = 7;
    const carRatePerKm = 15;

    const autoBaseFare = 30;
    const bikeBaseFare = 20;
    const carBaseFare = 50;

    const autoFare = Math.round(autoBaseFare + (distanceKm * autoRatePerKm) + (durationMin * 1));
    const bikeFare = Math.round(bikeBaseFare + (distanceKm * bikeRatePerKm) + (durationMin * 0.7));
    const carFare = Math.round(carBaseFare + (distanceKm * carRatePerKm) + (durationMin * 2));

    return {
        auto: autoFare,
        bike: bikeFare,
        car: carFare,
        distanceKm,
        durationMin
    };
}

export async function confirmRide(rideId: string, driver: any) {
    if (!rideId || !driver) {
        throw new Error('Ride ID and driver are required to confirm a ride');
    }
    await Ride.findByIdAndUpdate(rideId, {
        driver: driver,
        status: 'accepted'
    })

    const ride= await Ride.findById(rideId).populate('user');
    if (!ride || !ride.user) {
    throw new Error('Ride or user not found');
}

    const userWithSocket = ride.user as IUser;

    return {
        ...ride.toObject(),
        user: userWithSocket
    };
}

export async function startRide(rideId: string,otp:Number, driver: any) {
    if (!rideId || !driver) {
        throw new Error('Ride ID and driver are required to start a ride');
    }
    const ride = await Ride.findById(rideId).populate('user').populate('driver').select('+OTP');
    if (!ride) {
        throw new Error('Ride not found');
    }
    if (ride.status !== 'accepted') {
        throw new Error('Ride must be in accepted status to start');
    }
    if (ride.OTP !== otp) {
        throw new Error('Invalid OTP');
    }
    ride.status = 'ongoing';
    await ride.save();
    const userWithSocket = ride.user as IUser;
    const driverWithSocket = ride.driver as IUser;
    if (!userWithSocket || !driverWithSocket) {
        throw new Error('User or driver not found');
    }

    sendMessageToSocketId(userWithSocket.socketId, {
        event: 'ride-started',
        data: ride
    });
    return {
        ...ride.toObject(),
        user: userWithSocket
    };
}

export const endRide = async (rideId: string, driver: any) => {
    if (!rideId || !driver) {
        throw new Error('Ride ID and driver are required to end a ride');
    }
    const ride = await Ride.findOne({
        _id:rideId,
        driver: driver._id
    }).populate('user').populate('driver');
    if (!ride) {
        throw new Error('Ride not found');
    }
    if (ride.status !== 'ongoing') {
        throw new Error('Ride must be in ongoing status to end');
    }
    ride.status = 'completed';
    await ride.save();
    
    const userWithSocket = ride.user as IUser;
    if (!userWithSocket) {
        throw new Error('User not found');
    }

    sendMessageToSocketId(userWithSocket.socketId, {
        event: 'ride-ended',
        data: ride
    });
    
    return {
        ...ride.toObject(),
        user: userWithSocket
    };
}