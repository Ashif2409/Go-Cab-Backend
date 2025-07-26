import {
    Document
} from 'mongoose';

export interface IDriver extends Document {
    email: string;
    password: string;
    socketId: string;
    name ? : {
        firstName: string;
        lastName ? : string | null;
    } | null;
    vehicle: {
        color: string;
        plate: string;
        capacity: number;
        vehicleType: 'car' | 'bike' | 'auto';
    };
    location ? : {
        lat ? : number;
        lng ? : number;
    };
    status: 'active' | 'inactive';
    getAuthToken(): string;
    comparePassword(candidatePassword: string): Promise < boolean > ;
}