import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { startRuleScheduler } from './services/scheduler.service';

// Import routes
import authRoutes from './routes/auth.routes';
import bitcoinRoutes from './routes/bitcoin.routes';
import ruleRoutes from './routes/rule.routes';
import blockExplorerRoutes from './routes/blockExplorer.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://43.224.183.133:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://43.224.183.133:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Bitcoin Node Manager API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/explorer', blockExplorerRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start the rule scheduler
  startRuleScheduler();
});
