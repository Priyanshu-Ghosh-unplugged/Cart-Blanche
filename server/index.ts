import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import pravaRoutes from './routes/pravaRoutes';
import bomRoutes from './routes/bomRoutes';
import orderRoutes from './routes/orderRoutes';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CartBlanche Backend Engine',
    pravaApi: 'Active',
    database: 'SQLite (cartblanche.db)',
    timestamp: new Date().toISOString()
  });
});

// REST API Routers
app.use('/api/prava', pravaRoutes);
app.use('/api/goals', bomRoutes);
app.use('/api/orders', orderRoutes);

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CartBlanche Full-Stack Server running on Port ${PORT}`);
  console.log(`🔒 Prava Virtual Card API Engine: ACTIVE`);
  console.log(`💾 SQLite Database Engine: ACTIVE (cartblanche.db)`);
  console.log(`=======================================================`);
});
