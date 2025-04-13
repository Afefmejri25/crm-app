import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';

// Get all documents (Admin sees all, Agent sees their own)
export const getDocuments = async (req, res) => {
  console.log("getDocuments: Start"); // Debugging log
  try {
    const documents =
      req.user.role === 'admin'
        ? await Document.find({}).populate('uploadedBy', 'name email')
        : await Document.find({ uploadedBy: req.user._id }).populate('uploadedBy', 'name email');

    console.log("getDocuments: Retrieved documents:", documents); // Debugging log
    res.status(200).json(documents);
  } catch (error) {
    console.error("getDocuments: Error fetching documents:", error.message || error);
    res.status(500).json({ message: "Failed to fetch documents." });
  }
};

// Upload a new document
export const uploadDocument = async (req, res) => {
  console.log("uploadDocument: Start"); // Debugging log
  console.log("uploadDocument: Incoming request body:", req.body); // Debugging log

  try {
    const { title, description, fileType } = req.body;
    const fileContent = req.file?.path; // Ensure file is uploaded and path is available

    // Validate required fields
    if (!title || !fileType || !fileContent) {
      console.error("uploadDocument: Missing required fields"); // Debugging log
      return res.status(400).json({ message: "Title, file type, and file content are required fields." });
    }

    const document = new Document({
      title,
      description,
      fileUrl: fileContent, // Save file path
      fileType,
      uploadedBy: req.user._id,
    });

    const uploadedDocument = await document.save();
    console.log("uploadDocument: Document saved:", uploadedDocument); // Debugging log

    res.status(201).json(uploadedDocument);
  } catch (error) {
    console.error("uploadDocument: Error uploading document:", error.message || error);
    res.status(500).json({ message: "Failed to upload document." });
  }
};

// Download a document
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to download this document." });
    }

    const filePath = path.join(process.cwd(), document.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server." });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}${path.extname(document.fileUrl)}"`);
    res.setHeader('Content-Type', document.fileType);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error("Error streaming file:", error);
      res.status(500).json({ message: "Error downloading file." });
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ message: "Failed to download document." });
  }
};

// Delete a document
export const deleteDocument = async (req, res) => {
  console.log("deleteDocument: Start"); // Debugging log
  const { id } = req.params;
  console.log("deleteDocument: Document ID:", id); // Debugging log

  try {
    const document = await Document.findById(id);

    if (!document) {
      console.error("deleteDocument: Document not found"); // Debugging log
      return res.status(404).json({ message: "Document not found." });
    }

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
      console.error("deleteDocument: Not authorized to delete this document"); // Debugging log
      return res.status(403).json({ message: "Not authorized to delete this document." });
    }

    // Delete the file from the filesystem
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.remove();
    console.log("deleteDocument: Document removed successfully"); // Debugging log
    res.json({ message: "Document removed successfully." });
  } catch (error) {
    console.error("deleteDocument: Error deleting document:", error.message || error);
    res.status(500).json({ message: "Failed to delete document." });
  }
};
