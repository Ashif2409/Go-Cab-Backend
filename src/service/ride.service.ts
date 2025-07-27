import Ride from "../models/ride/ride.model";
import { getDistanceAndTime } from "./maps.service";
import crypto from "crypto";


function createOTP(num:Number): number {
    // Use crypto for secure random OTP generation
    const otp = parseInt(crypto.randomInt(100000, 1000000).toString(), 10);
    return otp;

}
export const createRide = async (
    userId: string,
    pickupLocation: string,
    destination: string,
    vehicleType: string,
) => {
   if(!pickupLocation || !destination || !vehicleType || !userId) {
        throw new Error('Pickup location, destination, vehicle type and user ID are required to create a ride');
    }
    const fare = await getFare(pickupLocation, destination);  

    if (!['auto', 'bike', 'car'].includes(vehicleType)) {
        throw new Error('Invalid vehicle type. Must be one of: auto, bike, car');
    }

    const ride = Ride.create({
        userId,
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

    const autoFare = autoBaseFare + (distanceKm * autoRatePerKm) + (durationMin * 1);
    const bikeFare = bikeBaseFare + (distanceKm * bikeRatePerKm) + (durationMin * 0.7);
    const carFare = carBaseFare + (distanceKm * carRatePerKm) + (durationMin * 2);

    return {
        auto: autoFare,
        bike: bikeFare,
        car: carFare,
        distanceKm,
        durationMin
    };
}