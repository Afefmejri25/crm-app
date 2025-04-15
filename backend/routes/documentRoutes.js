import express from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { protect, checkPermissions } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all documents (Agents can view their own, Admins can view all)
router.get('/', checkPermissions(['view_documents']), getDocuments);

// Upload a new document (Agents can manage their own documents, Admins can manage all)
router.post(
  '/',
  checkPermissions(['manage_own_documents', 'manage_documents']),
  upload.single('file'),
  uploadDocument
);

// Download a document (Agents can view their own, Admins can view all)
router.get('/download/:id', checkPermissions(['view_documents']), downloadDocument);

// Delete a document (Agents can delete their own, Admins can delete all)
router.delete(
  '/:id',
  checkPermissions(['manage_own_documents', 'manage_documents']),
  deleteDocument
);

export default router;
