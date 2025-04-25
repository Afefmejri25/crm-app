import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation
import { checkPermissions } from '../middleware/authMiddleware.js'; // Import checkPermissions middleware
import multer from "multer"; // Import multer for file upload handling

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];

const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed."));
  }
};

export const upload = multer({ storage, fileFilter });

// Get all documents for the logged-in user
export const getDocuments = async (req, res, next) => {
  try {
    console.log("getDocuments: User role:", req.user.role); // Debugging log
    console.log("getDocuments: User ID:", req.user._id); // Debugging log

    // Filter documents based on user role
    const filter = req.user.role === "admin" ? {} : { uploadedBy: req.user._id };

    console.log("getDocuments: Filter applied:", filter); // Debugging log

    const documents = await Document.find(filter);

    console.log("getDocuments: Retrieved documents:", documents); // Debugging log

    // Ensure the response is always an array
    res.status(200).json({ documents: documents || [] });
  } catch (error) {
    console.error("Error retrieving documents:", error); // Debugging log
    res.status(500).json({ message: "Failed to retrieve documents." });
  }
};

// Upload a new document
export const uploadDocument = async (req, res, next) => {
  try {
    console.log("Incoming request to upload document:", req.body); // Debugging log
    console.log("Uploaded file details:", req.file); // Debugging log

    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded.");
    }

    const { title, description } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error("Title and description are required.");
    }

    const document = new Document({
      title,
      description,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    const savedDocument = await document.save();
    console.log("Document saved successfully:", savedDocument); // Debugging log
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error("Error uploading document:", error.message || error); // Debugging log
    next(error); // Pass error to centralized error handler
  }
};

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
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        console.error("deleteDocument: Invalid or missing document ID."); // Debugging log
        res.status(400);
        throw new Error("Invalid or missing document ID.");
      }

      const document = await Document.findById(id);

      if (!document) {
        console.error("deleteDocument: Document not found."); // Debugging log
        res.status(404);
        throw new Error("Document not found.");
      }

      if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
        console.error("deleteDocument: Unauthorized access."); // Debugging log
        res.status(403);
        throw new Error("Not authorized to delete this document.");
      }

      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        console.log("deleteDocument: Deleting file:", filePath); // Debugging log
        fs.unlinkSync(filePath);
      }

      await document.deleteOne();
      res.json({ message: "Document removed successfully." });
    } catch (error) {
      console.error("deleteDocument: Error:", error); // Debugging log
      next(error);
    }
  }
];
