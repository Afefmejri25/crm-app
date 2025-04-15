import express from 'express';
import {
  getStatistics,
  getCallTargetStats,
  getRegionStats,
  getMetrics,
  getMonthlyPerformance,
  getStatsOverview,
  getStatsDetails,
  getTargetStats,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Route to get statistics (Both admin and agent)
router.get('/', getStatistics);

// Route to get call target statistics
router.get("/call-target", getCallTargetStats);

// Route to get region statistics
router.get("/regions", getRegionStats);

// Route to fetch metrics
router.get("/metrics", getMetrics);

// Route to fetch monthly performance statistics
router.get("/monthly-performance", getMonthlyPerformance);

// Route to get stats overview
router.get('/overview', getStatsOverview);

// Route to get stats details
router.get('/details', getStatsDetails);

// Route to fetch target stats
router.get("/targets", getTargetStats);

export default router;
