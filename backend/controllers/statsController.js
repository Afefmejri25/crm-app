import Call from '../models/Call.js';
import User from '../models/User.js';
import Client from '../models/Client.js';

export const getStatistics = async (req, res) => {
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
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics." });
  }
};

// Get call target statistics
export const getCallTargetStats = async (req, res) => {
  try {
    const targetCalls = 500; // Example target for the month
    const completedCalls = await Call.countDocuments({});
    const todayCalls = await Call.countDocuments({
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    const progress = ((completedCalls / targetCalls) * 100).toFixed(2); // Calculate progress percentage
    const growth = Math.floor(Math.random() * 21) - 10; // Example growth percentage (-10% to +10%)

    res.status(200).json({
      progress: parseFloat(progress),
      growth,
      targetCalls,
      completedCalls,
      todayCalls,
    });
  } catch (error) {
    console.error("Error fetching call target stats:", error);
    res.status(500).json({ message: "Failed to fetch call target statistics." });
  }
};

// Get region statistics
export const getRegionStats = async (req, res) => {
  try {
    const regionStats = await Client.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
    ]);

    if (!regionStats.length) {
      return res.status(404).json({ message: "No region statistics found." });
    }

    res.status(200).json(regionStats);
  } catch (error) {
    console.error("Error fetching region stats:", error);
    res.status(500).json({ message: "Failed to fetch region statistics." });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalCalls = await Call.countDocuments();

    // Calculate client growth based on the number of clients added in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClientsLast30Days = await Client.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const clientGrowth = totalClients > 0 ? (newClientsLast30Days / totalClients) * 100 : 0;

    // Calculate call growth based on the number of calls made in the last 30 days
    const newCallsLast30Days = await Call.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const callGrowth = totalCalls > 0 ? (newCallsLast30Days / totalCalls) * 100 : 0;

    res.status(200).json({
      totalClients,
      totalCalls,
      clientGrowth: clientGrowth.toFixed(2), // Return as a percentage with 2 decimal places
      callGrowth: callGrowth.toFixed(2), // Return as a percentage with 2 decimal places
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ message: "Failed to fetch metrics." });
  }
};

export const getMonthlyPerformance = async (req, res) => {
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
    console.error("Error fetching monthly performance statistics:", error);
    res.status(500).json({ message: "Failed to fetch monthly performance statistics." });
  }
};

// Get detailed statistics
export const getStatsDetails = async (req, res) => {
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
    console.error("Error fetching detailed statistics:", error.message || error);
    res.status(500).json({ message: "Failed to fetch detailed statistics. Please try again later." });
  }
};

// Get an overview of statistics
export const getStatsOverview = async (req, res) => {
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
    console.error("Error fetching statistics overview:", error.message || error);
    res.status(500).json({ message: "Failed to fetch statistics overview. Please try again later." });
  }
};
