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
export const createClient = async (req, res, next) => {
  const { companyName, contactName, email, phone, address, region, annualRevenue } = req.body;

  try {
    if (!companyName || !contactName || !email || !phone) {
      res.status(400);
      throw new Error("All fields are required.");
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      res.status(403);
      throw new Error("Client already exists with this email.");
    }

    const client = new Client({
      companyName,
      contactName,
      email,
      phone,
      address,
      region,
      annualRevenue,
      createdBy: req.user._id,
    });

    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    next(error);
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
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select(
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

// Delete a client
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error("Client not found.");
    }

    await client.remove();
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
