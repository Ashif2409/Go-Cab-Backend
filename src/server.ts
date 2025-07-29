import app from './app';
import { createServer } from 'http';
import { initializeSocket } from './socket';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});