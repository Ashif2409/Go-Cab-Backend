import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IDriver } from './driver.interface';

const driverSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      required: true,
      minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      minlength: [2, 'Last name must be at least 2 characters'],
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  socketId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [3, 'Color must be at least 3 characters'],
        },
        plate: {
            type: String,
            required: true,
            minlength: [3, 'Plate number must be at least 3 characters'],
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'Capacity must be at least 1'],
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'bike', 'auto']
        },
    },
    location: {
        lat: {
            type: Number
        },
        lng: {
            type: Number
        }
    }
});

driverSchema.methods.getAuthToken = function() {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
}

driverSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

driverSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Driver = mongoose.model<IDriver>('Driver', driverSchema);
export default Driver;