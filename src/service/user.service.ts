import userModel from "../models/user/user.model";

export const createUser = async (userData: {
  name: { firstName: string; lastName: string };    
    email: string;
    password: string;
}) => {
  const user = new userModel(userData);
  await user.save();
  return user;
}