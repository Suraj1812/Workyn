import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import app from './app.js';
import { startAiWorker } from './ai-engine/worker.js';
import connectDB from './config/db.js';
import { authenticateSocket, registerChatHandlers } from './sockets/chatSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  connectionStateRecovery: {},
  maxHttpBufferSize: Number(process.env.SOCKET_MAX_BUFFER_BYTES || 5 * 1024 * 1024),
});

app.set('io', io);

io.use(authenticateSocket);
io.on('connection', (socket) => {
  registerChatHandlers(io, socket);
});

const startServer = async () => {
  try {
    await connectDB();
    startAiWorker();
    server.listen(PORT, () => {
      console.log(`Workyn server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
