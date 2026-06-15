import { Router } from 'express';
import {
  listObservations,
  getObservation,
  createObservation,
  updateObservation,
  updateStatus,
  upsertScores,
} from '../controllers/observationController.js';

const router = Router();

router.get('/', listObservations);
router.post('/', createObservation);
router.get('/:id', getObservation);
router.put('/:id', updateObservation);
router.patch('/:id/status', updateStatus);
router.post('/:id/scores', upsertScores);

export default router;
