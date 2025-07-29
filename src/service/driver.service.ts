import Driver from "../models/driver/driver.model";

export const createDriver = async (driverData: {
  name: { firstName: string; lastName?: string | null };
    email: string;
    password: string;
    vehicle: {
      color: string;
        plate: string;
        capacity: number;
        vehicleType: 'car' | 'bike' | 'auto';
    };
    location?: {
      lat?: number;
      lng?: number;
    };
    status?: 'active' | 'inactive';
}) => {
    const driver = new Driver(driverData);
    await driver.save();
    return driver;
}