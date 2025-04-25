import Call from '../models/Call.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Appointment from "../models/Appointment.js";
import Document from "../models/Document.js";
import Email from "../models/Email.js";

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

// Fetch daily performance statistics
export const getDailyPerformance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newClients = await Client.countDocuments({ createdAt: { $gte: today } });
    const calls = await Call.countDocuments({ callDate: { $gte: today } });
    const appointments = await Appointment.countDocuments({ startTime: { $gte: today } });
    const emails = await Email.countDocuments({ sentAt: { $gte: today } });

    const topAgents = await Call.aggregate([
      { $match: { callDate: { $gte: today } } },
      { $group: { _id: "$createdBy", totalCalls: { $sum: 1 } } },
      { $sort: { totalCalls: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agentDetails",
        },
      },
    ]);

    res.status(200).json({
      newClients,
      calls,
      appointments,
      emails,
      topAgents: topAgents.map((agent) => ({
        id: agent._id,
        name: agent.agentDetails[0]?.name || "Inconnu",
        totalCalls: agent.totalCalls,
      })),
    });
  } catch (error) {
    console.error("Error fetching daily performance:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des performances quotidiennes." });
  }
};

// Fetch agents' performance statistics
export const getAgentsPerformance = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" });

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const calls = await Call.countDocuments({ createdBy: agent._id });
        const appointments = await Appointment.countDocuments({ createdBy: agent._id });
        const emails = await Email.countDocuments({ createdBy: agent._id });

        const callSuccessRate = calls
          ? Math.round(
              (await Call.countDocuments({ createdBy: agent._id, result: "answered" })) / calls * 100
            )
          : 0;

        return {
          id: agent._id,
          name: agent.name,
          newClients: await Client.countDocuments({ createdBy: agent._id }),
          calls,
          appointments,
          emails,
          callSuccessRate,
        };
      })
    );

    res.status(200).json({ performance });
  } catch (error) {
    console.error("Error fetching agents' performance:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des performances des agents." });
  }
};

// Fetch detailed analytics
export const getDetailedAnalytics = async (req, res) => {
  try {
    const totalCalls = await Call.countDocuments();
    const successfulCalls = await Call.countDocuments({ result: "Success" });
    const failedCalls = totalCalls - successfulCalls;

    const regionStats = await Client.aggregate([
      { $group: { _id: "$region", totalClients: { $sum: 1 } } },
      { $sort: { totalClients: -1 } },
    ]);

    const monthlyPerformance = await Call.aggregate([
      {
        $group: {
          _id: { $month: "$callDate" },
          totalCalls: { $sum: 1 },
          successfulCalls: { $sum: { $cond: [{ $eq: ["$result", "Success"] }, 1, 0] } },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthlyStats = monthlyPerformance.map((month) => ({
      month: month._id,
      totalCalls: month.totalCalls,
      successRate: month.totalCalls
        ? Math.round((month.successfulCalls / month.totalCalls) * 100)
        : 0,
    }));

    res.status(200).json({
      totalCalls,
      successfulCalls,
      failedCalls,
      regionStats,
      monthlyStats,
    });
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques détaillées." });
  }
};

// Fetch metrics
export const getMetrics = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const filter = agentId
      ? { createdBy: agentId }
      : req.user.role === "admin"
      ? {}
      : { createdBy: req.user._id };

    const totalCalls = await Call.countDocuments(filter);
    const totalClients = await Client.countDocuments(filter);
    const totalAppointments = await Appointment.countDocuments(filter);
    const totalDocuments = await Document.countDocuments(filter);
    const totalEmails = await Email.countDocuments(filter);
    const totalCallbacks = await Call.countDocuments({
      ...filter,
      result: "callback",
    });

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
      totalEmails,
      totalCallbacks,
      successRate: successRate.toFixed(2),
    });
  } catch (error) {
    next(error);
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
