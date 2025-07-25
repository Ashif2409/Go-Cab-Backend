// types/user.interface.ts
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  socketId: string;
  name?: {
    firstName: string;
    lastName?: string | null;
  } | null;
  getAuthToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
