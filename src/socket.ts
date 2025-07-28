import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import User from './models/user/user.model';
import Driver from './models/driver/driver.model';

interface JoinData {
    userId: string;
    userType: 'user' | 'driver';
}

interface SocketMessage {
    event: string;
    data: any;
}

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000,
    });

    io.on('connection', (socket: Socket) => {
        console.log('A user connected with socket id:', socket.id);

        // Handle user/driver joining
        socket.on('join', async (data: JoinData) => {
            try {
                const { userId, userType } = data;
                
                if (!userId || !userType) {
                    socket.emit('error', { message: 'Invalid join data provided' });
                    return;
                }

                if (userType === 'user') {
                    const user = await User.findById(userId);
                    if (!user) {
                        socket.emit('error', { message: `User with ID ${userId} not found` });
                        return;
                    }
                    user.socketId = socket.id;
                    await user.save();
                    socket.emit('joined', { message: 'Successfully joined as user' });
                } else if (userType === 'driver') {
                    const driver = await Driver.findById(userId);
                    if (!driver) {
                        socket.emit('error', { message: `Driver with ID ${userId} not found` });
                        return;
                    }
                    driver.socketId = socket.id;
                    await driver.save();
                    socket.emit('joined', { message: 'Successfully joined as driver' });
                }

                console.log(`${userType} ${userId} registered with socket ${socket.id}`);
            } catch (error) {
                console.error('Error in join event:', error);
                socket.emit('error', { message: 'Internal server error during join' });
            }
        });

        // Handle location updates (for drivers)
        socket.on('updateLocation', async (data: { driverId: string; location: { lat: number; lng: number } }) => {
            try {
                const driver = await Driver.findById(data.driverId);
                if (driver && driver.socketId === socket.id) {
                    // Update driver location in database
                    driver.location = data.location;
                    await driver.save();
                    // Broadcast to nearby users if needed
                    socket.broadcast.emit('driverLocationUpdated', {
                        driverId: data.driverId,
                        location: data.location
                    });
                }
            } catch (error) {
                console.error('Error updating location:', error);
                socket.emit('error', { message: 'Failed to update location' });
            }
        });

        socket.on('disconnect', async () => {
            try {
                // Update user/driver status on disconnect
                await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
                await Driver.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
                console.log('Client disconnected:', socket.id);
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });

    return io;
};

export const sendMessageToSocketId = async (socketId: string, message: SocketMessage): Promise<boolean> => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }

    try {
        const socket = io.sockets.sockets.get(socketId);
        if (!socket) {
            console.log(`Socket ${socketId} not found`);
            return false;
        }

        socket.emit(message.event, message.data);
        return true;
    } catch (error) {
        console.error('Error sending message to socket:', error);
        return false;
    }
};
