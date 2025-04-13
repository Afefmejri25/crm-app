import Client from '../models/Client.js';

// Get all clients (Admin sees all, Agent sees their own)
export const getClients = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const clients = await Client.find(query).select(
      "id companyName contactName email phone region status createdBy createdAt"
    ); // Ensure only required fields are returned
    res.status(200).json(clients);
  } catch (error) {
    console.error("getClients: Error fetching clients:", error.message || error);
    res.status(500).json({ message: "Failed to fetch clients." });
  }
};

// Create a new client
export const createClient = async (req, res) => {
  const { companyName, contactName, email, phone, address, region, annualRevenue } = req.body;

  try {
    if (!companyName || !contactName || !email || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Client already exists with this email." });
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
    res.status(201).json({
      id: savedClient._id,
      companyName: savedClient.companyName,
      contactName: savedClient.contactName,
      email: savedClient.email,
      phone: savedClient.phone,
      region: savedClient.region,
      status: savedClient.status,
      createdBy: savedClient.createdBy,
      createdAt: savedClient.createdAt,
    });
  } catch (error) {
    console.error("createClient: Error creating client:", error.message || error);
    res.status(500).json({ message: "Failed to create client." });
  }
};

// Get a client by ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client." });
  }
};

// Update an existing client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select(
      "id companyName contactName email phone region status createdBy createdAt"
    ); // Ensure only required fields are returned

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("updateClient: Error updating client:", error.message || error);
    res.status(500).json({ message: "Failed to update client." });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    await client.remove();
    res.json({ message: "Client removed successfully." });
  } catch (error) {
    console.error("deleteClient: Error deleting client:", error.message || error);
    res.status(500).json({ message: "Failed to delete client." });
  }
};

// Search clients
export const searchClients = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    console.error("searchClients: Missing query parameter"); // Debugging log
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    console.log("searchClients: Query parameter received:", query); // Debugging log

    const clients = await Client.find(
      {
        $or: [
          { companyName: { $regex: query, $options: "i" } },
          { contactName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      "id companyName contactName email phone region status createdBy createdAt" // Limit the fields returned
    ).limit(20); // Limit the number of results

    console.log("searchClients: Clients found:", clients); // Debugging log

    if (!clients.length) {
      console.warn("searchClients: No clients found matching the query"); // Debugging log
      return res.status(404).json({ message: "No clients found matching the query." });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error("searchClients: Error occurred:", error.message || error); // Debugging log
    res.status(500).json({ message: "Failed to search clients. Please try again later." });
  }
};
