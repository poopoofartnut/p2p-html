const express = require('express');
const redis = require('redis');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

const client = redis.createClient({
    username: 'default',
    password: '8ktdsswTybAii0zlLTtF7Tz3BWFtD93c',
    socket: {
        host: 'redis-18079.c285.us-west-2-2.ec2.redns.redis-cloud.com',
        port: 18079
    }
});

// Middleware to parse JSON requests
app.use(express.json());

// ... existing endpoints ...

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user info when they connect
    socket.on('user_connect', async (userData) => {
        const { userId, publicKey, displayName } = userData;
        if (!userId || !publicKey || !displayName) {
            socket.emit('error', 'Missing user data');
            return;
        }

        try {
            await client.hSet(userId, {
                publicKey: publicKey,
                displayName: displayName,
                socketId: socket.id
            });
            console.log(`User ${userId} connected and stored in Redis`);
        } catch (err) {
            console.error('Error storing user data:', err);
            socket.emit('error', 'Error storing user data');
        }
    });

    // Handle user disconnection
    socket.on('disconnect', async () => {
        console.log('A user disconnected');
        try {
            const users = await client.keys('*');
            for (const userId of users) {
                const userData = await client.hGetAll(userId);
                if (userData.socketId === socket.id) {
                    await client.del(userId);
                    console.log(`User ${userId} disconnected and removed from Redis`);
                    break;
                }
            }
        } catch (err) {
            console.error('Error removing user data:', err);
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});