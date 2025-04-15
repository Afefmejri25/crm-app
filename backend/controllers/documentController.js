import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { checkPermissions } from '../middleware/authMiddleware.js'; // Import checkPermissions middleware

// Get all documents (Admin sees all, Agent sees their own)
export const getDocuments = [
  checkPermissions(['view_documents']), // Apply permission check
  async (req, res, next) => {
    try {
      console.log("getDocuments: User role:", req.user.role); // Debugging log
      console.log("getDocuments: User ID:", req.user._id); // Debugging log

      const query = req.user.role === "admin" ? {} : { uploadedBy: req.user._id };
      const documents = await Document.find(query).populate("uploadedBy", "name email");

      console.log("getDocuments: Retrieved documents:", documents); // Debugging log
      res.status(200).json(documents);
    } catch (error) {
      console.error("getDocuments: Error:", error); // Debugging log
      next(error); // Pass error to centralized error handler
    }
  }
];

// Upload a new document
export const uploadDocument = [
  checkPermissions(['manage_own_documents', 'manage_documents']), // Apply permission check
  async (req, res, next) => {
    try {
      console.log("uploadDocument: Request body:", req.body); // Debugging log
      console.log("uploadDocument: Uploaded file:", req.file); // Debugging log

      const { title, description } = req.body;
      const fileUrl = req.file?.path;

      if (!title || !fileUrl) {
        console.error("uploadDocument: Missing title or fileUrl"); // Debugging log
        res.status(400);
        throw new Error("Title and file are required.");
      }

      const document = new Document({
        title,
        description,
        fileUrl,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
      });

      const savedDocument = await document.save();
      console.log("uploadDocument: Saved document:", savedDocument); // Debugging log
      res.status(201).json(savedDocument);
    } catch (error) {
      console.error("uploadDocument: Error:", error); // Debugging log
      next(error);
    }
  }
];

// Download a document
export const downloadDocument = [
  checkPermissions(['view_documents']), // Apply permission check
  async (req, res, next) => {
    try {
      console.log("downloadDocument: Document ID:", req.params.id); // Debugging log

      const document = await Document.findById(req.params.id);

      if (!document) {
        console.error("downloadDocument: Document not found"); // Debugging log
        res.status(404);
        throw new Error("Document not found.");
      }

      if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
        console.error("downloadDocument: Unauthorized access"); // Debugging log
        res.status(403);
        throw new Error("Not authorized to download this document.");
      }

      const filePath = path.join(process.cwd(), document.fileUrl);

      if (!fs.existsSync(filePath)) {
        console.error("downloadDocument: File not found on server"); // Debugging log
        res.status(404);
        throw new Error("File not found on server.");
      }

      console.log("downloadDocument: File path:", filePath); // Debugging log
      res.setHeader('Content-Disposition', `attachment; filename="${document.title}${path.extname(document.fileUrl)}"`);
      res.setHeader('Content-Type', document.fileType);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error("downloadDocument: File stream error:", error); // Debugging log
        next(error);
      });
    } catch (error) {
      console.error("downloadDocument: Error:", error); // Debugging log
      next(error);
    }
  }
];

// Delete a document
export const deleteDocument = [
  checkPermissions(['manage_own_documents', 'manage_documents']), // Apply permission check
  async (req, res, next) => {
    try {
      console.log("deleteDocument: Document ID:", req.params.id); // Debugging log

      const document = await Document.findById(req.params.id);

      if (!document) {
        console.error("deleteDocument: Document not found"); // Debugging log
        res.status(404);
        throw new Error("Document not found.");
      }

      if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
        console.error("deleteDocument: Unauthorized access"); // Debugging log
        res.status(403);
        throw new Error("Not authorized to delete this document.");
      }

      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        console.log("deleteDocument: Deleting file:", filePath); // Debugging log
        fs.unlinkSync(filePath);
      }

      await document.remove();
      console.log("deleteDocument: Document removed successfully"); // Debugging log
      res.json({ message: "Document removed successfully." });
    } catch (error) {
      console.error("deleteDocument: Error:", error); // Debugging log
      next(error);
    }
  }
];
