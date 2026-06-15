import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import {
  generateObservationSummary,
  generateReviewRecommendations,
} from '../services/aiService.js';

export const observationSummary = asyncHandler(async (req, res) => {
  const { observationId } = req.body;
  if (!observationId) throw new HttpError(400, 'observationId is required');

  const observation = await prisma.observation.findUnique({
    where: { id: observationId },
    include: { rubricScores: true, teacher: true },
  });
  if (!observation) throw new HttpError(404, 'Observation not found');

  const summary = await generateObservationSummary(observation);

  await prisma.observation.update({
    where: { id: observationId },
    data: { aiSummary: summary, aiGeneratedAt: new Date() },
  });

  res.json({ summary });
});

export const reviewRecommendations = asyncHandler(async (req, res) => {
  const { reviewId } = req.body;
  if (!reviewId) throw new HttpError(400, 'reviewId is required');

  const review = await prisma.performanceReview.findUnique({
    where: { id: reviewId },
    include: { criteriaScores: true, reviewee: true },
  });
  if (!review) throw new HttpError(404, 'Review not found');

  // Pull the most recent observation summary for this teacher, if any
  const recentObs = await prisma.observation.findFirst({
    where: { teacherId: review.revieweeId, aiSummary: { not: null } },
    orderBy: { observedDate: 'desc' },
  });
  review.recentObservationSummary = recentObs?.aiSummary || null;

  const recommendations = await generateReviewRecommendations(review);

  await prisma.performanceReview.update({
    where: { id: reviewId },
    data: {
      aiRecommendations: JSON.stringify(recommendations),
      aiGeneratedAt: new Date(),
    },
  });

  res.json({ recommendations });
});
