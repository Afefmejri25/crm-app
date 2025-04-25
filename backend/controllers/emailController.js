import Email from "../models/Email.js"; // Use `import` instead of `require`
import User from "../models/User.js"; // Use `import` instead of `require"

// Fetch all emails
export const getEmails = async (req, res) => {
  try {
    const emails = await Email.find()
      .populate("createdBy", "name email") // Populate createdBy with name and email
      .sort({ createdAt: -1 }); // Sort by most recent

    // Ensure the response includes a consistent structure
    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des emails." });
  }
};

// Create a new email
export const createEmail = async (req, res) => {
  try {
    const { subject, body, recipient } = req.body;

    // Log incoming request data for debugging
    console.log("Incoming Email Data:", { subject, body, recipient });

    if (!subject || !body || !recipient) {
      console.error("Validation Error: Missing required fields.");
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const email = await Email.create({
      subject,
      body,
      recipient,
      createdBy: req.user.id, // Ensure req.user.id is populated by the auth middleware
    });

    const populatedEmail = await email.populate("createdBy", "name email");
    res.status(201).json(populatedEmail);
  } catch (error) {
    console.error("Error creating email:", error.message || error);
    res.status(500).json({ message: "Erreur lors de la création de l'email." });
  }
};

// Delete an email
export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Use findByIdAndDelete to delete the email directly
    const email = await Email.findByIdAndDelete(id);

    if (!email) {
      return res.status(404).json({ message: "Email introuvable." });
    }

    res.status(200).json({ message: "Email supprimé avec succès." });
  } catch (error) {
    console.error("Error deleting email:", error.message || error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'email." });
  }
};
