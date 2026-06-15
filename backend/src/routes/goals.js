import { Router } from 'express';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateStatus,
  addMilestone,
  updateMilestone,
  updateMilestoneStatus,
  addUpdate,
} from '../controllers/goalController.js';

const router = Router();

router.get('/', listGoals);
router.post('/', createGoal);
router.get('/:id', getGoal);
router.put('/:id', updateGoal);
router.patch('/:id/status', updateStatus);

router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:mid', updateMilestone);
router.patch('/:id/milestones/:mid/status', updateMilestoneStatus);

router.post('/:id/updates', addUpdate);

export default router;
