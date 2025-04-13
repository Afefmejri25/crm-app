import Appointment from '../models/Appointment.js';

// Get all appointments (Admin sees all, Agent sees their own)
export const getAppointments = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const appointments = await Appointment.find(query)
      .populate("client", "companyName contactName")
      .populate("createdBy", "name email")
      .sort({ startTime: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("getAppointments: Error fetching appointments:", error.message || error);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  const { title, description, start, end, client, level, status, note } = req.body;

  try {
    // Validate required fields
    if (!title || !start || !end || !client) {
      return res.status(400).json({ message: "All required fields (title, start, end, client) must be provided." });
    }

    const appointment = new Appointment({
      title,
      description,
      start,
      end,
      client,
      createdBy: req.user._id,
      level,
      status,
      note,
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ message: "Duplicate appointment detected. Please check the title, start date, and client." });
    }
    console.error("Error creating appointment:", error.message || error);
    res.status(500).json({ message: "Failed to create appointment. Please check the input data and try again." });
  }
};

// Get an appointment by ID
export const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id).populate('client', 'companyName contactName');

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment by ID:", error.message || error);
    res.status(500).json({ message: "Failed to fetch appointment. Please try again later." });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { title, start, end, client, level, status, note } = req.body;

  try {
    // Validate required fields
    if (!title || !start || !end || !client) {
      return res.status(400).json({ message: "All required fields (title, start, end, client) must be provided." });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (req.user.role !== "admin" && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error.message || error);
    res.status(500).json({ message: "Failed to update appointment. Please check the input data and try again." });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this appointment' });
    }

    await appointment.remove();
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    console.error("Error deleting appointment:", error.message || error);
    res.status(500).json({ message: "Failed to delete appointment. Please try again later." });
  }
};
