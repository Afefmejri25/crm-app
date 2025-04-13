import express from 'express';
import {
  getCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
} from '../controllers/callController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all calls with optional filters
router.get('/', getCalls);

// Get a single call by ID
router.get('/:id', getCall);

// Get call history for a client
router.get('/client/:clientId', getCall);

// Create a new call
router.post('/', createCall);

// Update a call
router.put('/:id', updateCall);

// Delete a call
router.delete('/:id', deleteCall);

export default router;
