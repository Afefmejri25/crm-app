import express from 'express';
import {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
} from '../controllers/clientController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for client management
router.route('/').get(protect, getClients).post(protect, admin, createClient);
router
  .route('/:id')
  .get(protect, getClientById)
  .put(protect, admin, updateClient)
  .delete(protect, admin, deleteClient);

// Add search route
router.get('/search', protect, searchClients);

export default router;
