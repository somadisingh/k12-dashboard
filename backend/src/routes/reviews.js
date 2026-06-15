import { Router } from 'express';
import {
  listReviews,
  getReview,
  createReview,
  updateReview,
  updateStatus,
  upsertCriteria,
  selfAssess,
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', listReviews);
router.post('/', createReview);
router.get('/:id', getReview);
router.put('/:id', updateReview);
router.patch('/:id/status', updateStatus);
router.post('/:id/criteria', upsertCriteria);
router.put('/:id/self-assess', selfAssess);

export default router;
