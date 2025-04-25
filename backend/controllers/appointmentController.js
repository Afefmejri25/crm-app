import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

// Get all appointments (Admin sees all, Agent sees their own)
export const getAppointments = async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query; // Extract pagination parameters

  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const appointments = await Appointment.find(query)
      .populate("client", "companyName contactName")
      .populate("agent", "name email")
      .populate("createdBy", "name email")
      .sort({ startTime: 1 })
      .skip((page - 1) * limit) // Apply pagination
      .limit(parseInt(limit)); // Limit the number of results

    const totalAppointments = await Appointment.countDocuments(query); // Get total count

    res.status(200).json({
      appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { title, client, agent, startTime, endTime, location, status } = req.body;

    // Debugging logs
    console.log("Received appointment data:", req.body);

    // Validate required fields
    if (!title || !client || !agent || !startTime || !endTime) {
      console.error("createAppointment: Missing required fields.");
      res.status(400);
      throw new Error("Title, client, agent, startTime, and endTime are required.");
    }

    const appointment = new Appointment({
      title,
      client,
      agent,
      startTime,
      endTime,
      location: location || null,
      status: status || "scheduled",
      createdBy: req.user._id,
    });

    const savedAppointment = await appointment.save();
    console.log("Appointment created successfully:", savedAppointment);

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error.message || error);
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

    await appointment.deleteOne();
    res.json({ message: "Appointment removed successfully." });
  } catch (error) {
    next(error);
  }
};
