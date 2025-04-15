import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

// Get all appointments (Admin sees all, Agent sees their own)
export const getAppointments = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const appointments = await Appointment.find(query)
      .populate("client", "companyName contactName")
      .populate("agent", "name email")
      .populate("createdBy", "name email")
      .sort({ startTime: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
export const createAppointment = async (req, res, next) => {
  const { title, description, startTime, endTime, client, location, status } = req.body;

  try {
    if (!title || !startTime || !endTime || !client) {
      res.status(400);
      throw new Error("All required fields (title, startTime, endTime, client) must be provided.");
    }

    if (!mongoose.Types.ObjectId.isValid(client)) {
      res.status(400);
      throw new Error("Invalid client ID.");
    }

    if (new Date(endTime) <= new Date(startTime)) {
      res.status(400);
      throw new Error("End time must be after start time.");
    }

    const appointment = new Appointment({
      title,
      description,
      startTime,
      endTime,
      client,
      location,
      status,
      agent: req.user._id,
      createdBy: req.user._id,
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    next(error);
  }
};

// Get an appointment by ID
export const getAppointmentById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id)
      .populate('client', 'companyName contactName')
      .populate('agent', 'name email');

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found.");
    }

    if (req.user.role !== "admin" && appointment.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this appointment.");
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

// Update an appointment
export const updateAppointment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found.");
    }

    if (req.user.role !== "admin" && appointment.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this appointment.");
    }

    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404);
      throw new Error("Appointment not found.");
    }

    if (req.user.role !== "admin" && appointment.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this appointment.");
    }

    await appointment.remove();
    res.json({ message: "Appointment removed successfully." });
  } catch (error) {
    next(error);
  }
};
