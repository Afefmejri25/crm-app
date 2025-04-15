import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import callRoutes from './routes/callRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // Correct import
import path from 'path';
import { fileURLToPath } from 'url';
import { handleFallbackRoute } from './controllers/errorController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log("Request Headers:", req.headers);
  next();
});

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes); // Ensure this line exists
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware for handling invalid routes
app.use((req, res, next) => {
  console.error(`Invalid route accessed: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware for handling 404 errors
app.all('*', handleFallbackRoute);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
});