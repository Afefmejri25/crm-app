import express from "express";
import {
  getStatistics,
  getCallTargetStats,
  getRegionStats,
  getMetrics,
  getMonthlyPerformance,
  getDailyPerformance,
  getAgentsPerformance,
  getDetailedAnalytics,
} from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Route to get general statistics
router.get("/", getStatistics);

// Route to get call target statistics
router.get("/call-target", getCallTargetStats);

// Route to get region statistics
router.get("/regions", getRegionStats);

// Route to fetch metrics
router.get("/metrics", getMetrics);

// Route to fetch monthly performance statistics
router.get("/monthly-performance", getMonthlyPerformance);

// Route to fetch daily performance statistics
router.get("/daily-performance", getDailyPerformance);

// Route to fetch agents' performance statistics
router.get("/agents-performance", getAgentsPerformance);

// Route to fetch detailed analytics
router.get("/analytics", getDetailedAnalytics);

export default router;
