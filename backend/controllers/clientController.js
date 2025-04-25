import Client from '../models/Client.js';

// Get all clients (Admin sees all, Agent sees their own) with pagination
export const getClients = async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const clients = await Client.find(query)
      .select("id companyName contactName email phone region status createdBy createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalClients = await Client.countDocuments(query);

    res.status(200).json({
      clients,
      totalPages: Math.ceil(totalClients / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Create a new client
export const createClient = async (req, res) => {
  try {
    // Check if the user has the required role
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à créer un client." });
    }

    const { companyName, contactName, email, phone, address, region } = req.body;

    if (!companyName || !contactName) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    const client = new Client({
      companyName,
      contactName,
      email: email === "" ? undefined : email, // Set email to undefined if it's an empty string
      phone: phone === "" ? undefined : phone, // Set phone to undefined if it's an empty string
      address,
      region,
      createdBy: req.user._id, // Associate the client with the authenticated user
    });

    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Erreur lors de la création du client." });
  }
};

// Get a client by ID
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).select(
      "id companyName contactName email phone region status createdBy createdAt"
    );

    if (!client) {
      res.status(404);
      throw new Error("Client not found.");
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

// Update an existing client
export const updateClient = async (req, res, next) => {
  const { id } = req.params; // Extract the client ID from the request parameters
  const { companyName, contactName, email, phone, address, region, annualRevenue, tags } = req.body;

  try {
    if (!companyName || !contactName || !address || !region || !annualRevenue) {
      res.status(400);
      throw new Error("Tous les champs obligatoires doivent être remplis.");
    }

    const client = await Client.findById(id); // Find the client by ID
    if (!client) {
      res.status(404);
      throw new Error("Client introuvable.");
    }

    // Check if the user has permission to update the client
    if (req.user.role !== "admin" && client.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Vous n'êtes pas autorisé à modifier ce client.");
    }

    // Update client fields
    client.companyName = companyName || client.companyName;
    client.contactName = contactName || client.contactName;
    client.email = email === "" ? null : email || client.email;
    client.phone = phone || client.phone;
    client.address = address || client.address;
    client.region = region || client.region;
    client.annualRevenue = annualRevenue || client.annualRevenue;
    client.tags = tags || client.tags;

    const updatedClient = await client.save(); // Save the updated client to the database
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error.message || error); // Log the error for debugging
    next(error);
  }
};

// Delete a client
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error("Client not found.");
    }

    // Check if the user has permission to delete the client
    if (req.user.role !== "admin" && client.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this client.");
    }

    await client.deleteOne(); // Use deleteOne instead of remove
    res.json({ message: "Client removed successfully." });
  } catch (error) {
    next(error);
  }
};

// Search clients
export const searchClients = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error("Query parameter is required.");
  }

  try {
    const clients = await Client.find({
      $or: [
        { companyName: { $regex: query, $options: "i" } },
        { contactName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("id companyName contactName email phone region status createdBy createdAt")
      .limit(20);

    if (!clients.length) {
      res.status(404);
      throw new Error("No clients found matching the query.");
    }

    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};
