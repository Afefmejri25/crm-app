import express from 'express';
import {
  getStatistics,
  getCallTargetStats,
  getRegionStats,
  getMetrics,
  getMonthlyPerformance,
  getStatsOverview,
  getStatsDetails,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get statistics (Both admin and agent)
router.get('/', protect, getStatistics);

// Route to get call target statistics
router.get("/call-target", protect, getCallTargetStats);

// Route to get region statistics
router.get("/regions", protect, getRegionStats);

// Route to fetch metrics
router.get("/metrics", protect, getMetrics);

// Route to fetch monthly performance statistics
router.get("/monthly-performance", protect, getMonthlyPerformance);

// Route to get stats overview
router.get('/overview', protect, getStatsOverview);

// Route to get stats details
router.get('/details', protect, getStatsDetails);

export default router;
