import { Router } from 'express';
import { observationSummary, reviewRecommendations } from '../controllers/aiController.js';

const router = Router();

router.post('/observation-summary', observationSummary);
router.post('/review-recommendations', reviewRecommendations);

export default router;
