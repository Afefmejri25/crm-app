import express from 'express';
import {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
} from '../controllers/clientController.js';
import { protect, checkPermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Routes for client management
router.route('/')
  .get(getClients); // Fetch all clients

router.route('/create')
  .post(createClient); // Route for creating a client

router.route('/update/:id')
  .put(protect, checkPermissions(['manage_own_clients', 'manage_all_clients']), updateClient); // Ensure middleware and handler are applied

router.route('/:id')
  .get(getClientById) // Route for fetching a client by ID
  .delete(checkPermissions(['manage_own_clients', 'manage_all_clients', 'manage_clients']), deleteClient); // Route for deleting a client

// Search clients
router.get('/search', searchClients);

export default router;
