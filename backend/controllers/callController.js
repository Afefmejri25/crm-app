import Call from '../models/Call.js';
import { formatError, formatSuccess, handleValidationError, handleDuplicateKeyError, handleCastError } from '../utils/errorHandler.js';

// Get all calls with optional filters
export const getCalls = async (req, res) => {
  try {
    const { client, agent, startDate, endDate, result } = req.query;
    const filter = {};

    if (client) filter.client = client;
    if (agent) filter.agent = agent;
    if (result) filter.result = result;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const calls = await Call.find(filter)
      .populate("client", "name email phone")
      .populate("agent", "name email")
      .sort({ date: -1 });

    res.json(formatSuccess(calls));
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json(formatError("Erreur lors de la récupération des appels"));
  }
};

// Get a single call by ID
export const getCall = async (req, res) => {
  try {
    const call = await Call.findById(req.params.id)
      .populate("client", "name email phone")
      .populate("agent", "name email");

    if (!call) {
      return res.status(404).json(formatError("Appel non trouvé"));
    }

    res.json(formatSuccess(call));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json(handleCastError(error));
    }
    console.error("Error fetching call:", error);
    res.status(500).json(formatError("Erreur lors de la récupération de l'appel"));
  }
};

// Get call history for a client
export const getCallHistory = async (req, res) => {
  try {
    const calls = await Call.find({ client: req.params.clientId })
      .populate("agent", "name email")
      .sort({ date: -1 });

    res.json(formatSuccess(calls));
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json(formatError("Erreur lors de la récupération de l'historique des appels"));
  }
};

// Create a new call
export const createCall = async (req, res) => {
  try {
    const { client, agent, date, duration, result, notes, scheduledCallback } = req.body;

    if (!client || !agent || !date || !result) {
      return res.status(400).json(formatError("Tous les champs obligatoires doivent être remplis"));
    }

    const call = new Call({
      client,
      agent,
      date,
      duration,
      result,
      notes,
      scheduledCallback,
      createdBy: req.user._id,
    });

    await call.save();
    const populatedCall = await Call.findById(call._id)
      .populate("client", "name email phone")
      .populate("agent", "name email");

    res.status(201).json(formatSuccess(populatedCall, "Appel créé avec succès"));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json(handleValidationError(error));
    }
    if (error.code === 11000) {
      return res.status(400).json(handleDuplicateKeyError(error));
    }
    console.error("Error creating call:", error);
    res.status(500).json(formatError("Erreur lors de la création de l'appel"));
  }
};

// Update a call
export const updateCall = async (req, res) => {
  try {
    const { date, duration, result, notes, scheduledCallback } = req.body;
    const call = await Call.findById(req.params.id);

    if (!call) {
      return res.status(404).json(formatError("Appel non trouvé"));
    }

    if (date) call.date = date;
    if (duration) call.duration = duration;
    if (result) call.result = result;
    if (notes) call.notes = notes;
    if (scheduledCallback) call.scheduledCallback = scheduledCallback;
    call.updatedBy = req.user._id;

    await call.save();
    const updatedCall = await Call.findById(call._id)
      .populate("client", "name email phone")
      .populate("agent", "name email");

    res.json(formatSuccess(updatedCall, "Appel mis à jour avec succès"));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json(handleValidationError(error));
    }
    if (error.name === "CastError") {
      return res.status(400).json(handleCastError(error));
    }
    console.error("Error updating call:", error);
    res.status(500).json(formatError("Erreur lors de la mise à jour de l'appel"));
  }
};

// Delete a call
export const deleteCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndDelete(req.params.id);

    if (!call) {
      return res.status(404).json(formatError("Appel non trouvé"));
    }

    res.json(formatSuccess(null, "Appel supprimé avec succès"));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json(handleCastError(error));
    }
    console.error("Error deleting call:", error);
    res.status(500).json(formatError("Erreur lors de la suppression de l'appel"));
  }
};
