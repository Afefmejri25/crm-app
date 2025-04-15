import Call from '../models/Call.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Appointment from "../models/Appointment.js";
import Document from "../models/Document.js";

export const getStatistics = async (req, res, next) => {
  try {
    const totalCalls = await Call.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const successfulCalls = await Call.countDocuments({ result: 'Success' });
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    res.json({
      totalCalls,
      totalClients,
      totalAgents,
      successRate: successRate.toFixed(2),
    });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Get call target statistics
export const getCallTargetStats = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    // Ensure the filter is correctly applied based on agentId
    const filter = agentId ? { agent: agentId } : {};

    console.log("Filter applied:", filter); // Debugging log

    const targetCalls = 500; // Example target for the month
    const totalCalls = await Call.countDocuments(filter); // Fetch all calls made by the agent
    const todayCalls = await Call.countDocuments({
      ...filter,
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    console.log("Total calls:", totalCalls); // Debugging log
    console.log("Today's calls:", todayCalls); // Debugging log

    const progress = ((totalCalls / targetCalls) * 100).toFixed(2); // Calculate progress percentage
    const growth = Math.floor(Math.random() * 21) - 10; // Example growth percentage (-10% to +10%)

    res.status(200).json({
      progress: parseFloat(progress),
      growth,
      targetCalls,
      totalCalls,
      todayCalls,
    });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Get region statistics
export const getRegionStats = async (req, res, next) => {
  try {
    const regionStats = await Client.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
    ]);

    if (!regionStats.length) {
      return res.status(404).json({ message: "No region statistics found." });
    }

    res.status(200).json(regionStats);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

export const getMetrics = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    // Filter based on agentId or user role
    const filter = agentId
      ? { createdBy: agentId }
      : req.user.role === "admin"
      ? {}
      : { createdBy: req.user._id };

    const totalCalls = await Call.countDocuments(filter);
    const totalClients = await Client.countDocuments(filter);
    const totalAppointments = await Appointment.countDocuments(filter);
    const totalDocuments = await Document.countDocuments(filter);

    const successfulCalls = await Call.countDocuments({
      ...filter,
      result: "Success",
    });
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    res.status(200).json({
      totalCalls,
      totalClients,
      totalAppointments,
      totalDocuments,
      successRate: successRate.toFixed(2),
    });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

export const getMonthlyPerformance = async (req, res, next) => {
  try {
    const successRatePerMonth = Array(12).fill(0); // Placeholder for success rates
    const callsPerMonth = Array(12).fill(0); // Placeholder for call counts

    const calls = await Call.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          totalCalls: { $sum: 1 },
          successfulCalls: { $sum: { $cond: [{ $eq: ["$status", "Success"] }, 1, 0] } },
        },
      },
    ]);

    calls.forEach((call) => {
      const monthIndex = call._id - 1; // Convert month (1-12) to array index (0-11)
      callsPerMonth[monthIndex] = call.totalCalls;
      successRatePerMonth[monthIndex] = call.totalCalls
        ? Math.round((call.successfulCalls / call.totalCalls) * 100)
        : 0;
    });

    res.status(200).json({ successRatePerMonth, callsPerMonth });
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Get detailed statistics
export const getStatsDetails = async (req, res, next) => {
  try {
    // Example logic for fetching detailed statistics
    const statsDetails = {
      totalCalls: 120,
      successfulCalls: 90,
      failedCalls: 30,
      regions: [
        { region: "North America", calls: 50 },
        { region: "Europe", calls: 40 },
        { region: "Asia", calls: 30 },
      ],
    };

    res.status(200).json(statsDetails);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

// Get an overview of statistics
export const getStatsOverview = async (req, res, next) => {
  try {
    // Example logic for fetching statistics overview
    const statsOverview = {
      totalUsers: 100,
      totalDocuments: 200,
      totalCalls: 150,
      totalNotifications: 50,
    };

    res.status(200).json(statsOverview);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};

export const getTargetStats = async (req, res, next) => {
  try {
    const agentId = req.query.agentId;

    // Example logic for fetching target stats
    const stats = agentId
      ? { progress: 75, todayCalls: 10 } // Mock data for an agent
      : { progress: 50, todayCalls: 20 }; // Mock data for admin

    res.status(200).json(stats);
  } catch (error) {
    next(error); // Pass error to centralized error handler
  }
};
