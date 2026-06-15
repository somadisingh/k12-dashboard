import { Router } from 'express';
import {
  getKpis,
  getTrend,
  getPerformance,
  getActivity,
  getUpcoming,
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/kpis', getKpis);
router.get('/trend', getTrend);
router.get('/performance', getPerformance);
router.get('/activity', getActivity);
router.get('/upcoming', getUpcoming);

export default router;
