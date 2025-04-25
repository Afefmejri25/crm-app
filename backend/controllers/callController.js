import Call from '../models/Call.js';
import mongoose from 'mongoose';
import { formatError, formatSuccess, handleValidationError, handleDuplicateKeyError, handleCastError } from '../utils/errorHandler.js';

// Get all calls with role-based access
export const getCalls = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { agent: req.user._id };
    const calls = await Call.find(filter)
      .populate("client", "companyName email phone")
      .populate("agent", "name email")
      .sort({ date: -1 });
    res.json(calls);
  } catch (error) {
    next(error);
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
export const createCall = async (req, res, next) => {
  try {
    const { clientId, callDate, result, notes, callbackDate, duration } = req.body;

    console.log("Received call data:", req.body); // Debugging log

    if (!clientId || !callDate || !result) {
      res.status(400);
      throw new Error("All required fields (client, date, result) must be filled.");
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      res.status(400);
      throw new Error("Invalid client ID.");
    }

    const call = new Call({
      client: clientId, // Map clientId to client
      agent: req.user._id, // Set agent to the authenticated user's ID
      date: callDate, // Map callDate to date
      result,
      notes,
      callbackDate,
      duration,
      createdBy: req.user._id,
    });

    const savedCall = await call.save();
    console.log("Call saved successfully:", savedCall); // Debugging log

    const populatedCall = await Call.findById(savedCall._id)
      .populate("client", "companyName email phone")
      .populate("agent", "name email");

    res.status(201).json(populatedCall);
  } catch (error) {
    console.error("Error creating call:", error.message || error); // Debugging log
    next(error);
  }
};

// Update a call with role-based access
export const updateCall = async (req, res, next) => {
  try {
    const call = await Call.findById(req.params.id);

    if (!call) {
      res.status(404);
      throw new Error("Call not found.");
    }

    if (req.user.role !== "admin" && call.agent.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this call.");
    }

    Object.assign(call, req.body);
    const updatedCall = await call.save();
    res.json(updatedCall);
  } catch (error) {
    next(error);
  }
};

// Delete a call with role-based access
export const deleteCall = async (req, res, next) => {
  try {
    const call = await Call.findById(req.params.id);

    if (!call) {
      console.error(`deleteCall: Call with ID ${req.params.id} not found.`); // Debugging log
      res.status(404);
      throw new Error("Call not found.");
    }

    if (req.user.role !== "admin" && call.agent.toString() !== req.user._id.toString()) {
      console.error(`deleteCall: Unauthorized access by user ${req.user._id}.`); // Debugging log
      res.status(403);
      throw new Error("Not authorized to delete this call.");
    }

    await call.deleteOne();
    res.json({ message: "Call deleted successfully." });
  } catch (error) {
    next(error);
  }
};
