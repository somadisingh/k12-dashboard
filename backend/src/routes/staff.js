import { Router } from 'express';
import {
  listStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffTimeline,
  getStaffSummary,
} from '../controllers/staffController.js';

const router = Router();

router.get('/', listStaff);
router.post('/', createStaff);
router.get('/:id', getStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.get('/:id/timeline', getStaffTimeline);
router.get('/:id/summary', getStaffSummary);

export default router;
