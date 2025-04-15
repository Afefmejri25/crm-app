import express from 'express';
import {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
} from '../controllers/clientController.js';
import { protect, admin, checkPermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Routes for client management
router.route('/')
  .get(getClients)
  .post(createClient); // Add POST route for creating a client

router.route('/:id')
  .get(getClientById)
  .put(checkPermissions(['manage_own_clients', 'manage_all_clients'], 'some'), updateClient)
  .delete(admin, deleteClient); // Only admins can delete clients

// Search clients
router.get('/search', searchClients);

export default router;
