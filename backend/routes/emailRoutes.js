import express from "express";
import { getEmails, createEmail, deleteEmail } from "../controllers/emailController.js"; // Ensure named imports
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getEmails).post(protect, createEmail);
router.route("/:id").delete(protect, deleteEmail);

export default router;
