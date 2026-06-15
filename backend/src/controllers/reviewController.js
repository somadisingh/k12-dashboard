import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

const TRANSITIONS = {
  DRAFT: ['SELF_ASSESSMENT_PENDING', 'UNDER_REVIEW'],
  SELF_ASSESSMENT_PENDING: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['FEEDBACK_SHARED'],
  FEEDBACK_SHARED: ['MEETING_SCHEDULED', 'COMPLETED'],
  MEETING_SCHEDULED: ['COMPLETED'],
  COMPLETED: [],
};

const reviewInclude = {
  criteriaScores: true,
  reviewee: { include: { department: true } },
  reviewer: true,
};

function computeOverall(scores) {
  if (!scores.length) return null;
  const avg = scores.reduce((a, s) => a + s.score, 0) / scores.length;
  return Math.round(avg * 100) / 100;
}

export const listReviews = asyncHandler(async (req, res) => {
  const { revieweeId, status, reviewType, period } = req.query;
  const where = {};
  if (revieweeId) where.revieweeId = revieweeId;
  if (status) where.status = status;
  if (reviewType) where.reviewType = reviewType;
  if (period) where.reviewPeriod = { contains: period, mode: 'insensitive' };

  const reviews = await prisma.performanceReview.findMany({
    where,
    include: reviewInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

export const getReview = asyncHandler(async (req, res) => {
  const review = await prisma.performanceReview.findUnique({
    where: { id: req.params.id },
    include: reviewInclude,
  });
  if (!review) throw new HttpError(404, 'Review not found');
  res.json(review);
});

export const createReview = asyncHandler(async (req, res) => {
  const { revieweeId, reviewerId, reviewPeriod, reviewType } = req.body;
  if (!revieweeId || !reviewPeriod) {
    throw new HttpError(400, 'revieweeId and reviewPeriod are required');
  }
  const resolvedReviewerId = reviewerId || req.user.staff?.id;
  if (!resolvedReviewerId) {
    throw new HttpError(400, 'reviewerId is required (no staff profile on current user)');
  }

  const review = await prisma.performanceReview.create({
    data: {
      revieweeId,
      reviewerId: resolvedReviewerId,
      reviewPeriod,
      reviewType: reviewType || 'ANNUAL',
    },
    include: reviewInclude,
  });
  res.status(201).json(review);
});

export const updateReview = asyncHandler(async (req, res) => {
  const allowed = [
    'reviewPeriod',
    'reviewType',
    'summaryComments',
    'strengthsNarrative',
    'growthNarrative',
    'adminPrivateNotes',
  ];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.meetingDate !== undefined) {
    data.meetingDate = req.body.meetingDate ? new Date(req.body.meetingDate) : null;
  }

  const review = await prisma.performanceReview.update({
    where: { id: req.params.id },
    data,
    include: reviewInclude,
  });
  res.json(review);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new HttpError(400, 'status is required');

  const current = await prisma.performanceReview.findUnique({ where: { id: req.params.id } });
  if (!current) throw new HttpError(404, 'Review not found');

  const legal = TRANSITIONS[current.status] || [];
  if (!legal.includes(status)) {
    throw new HttpError(
      400,
      `Illegal status transition: ${current.status} → ${status}. Allowed: ${
        legal.join(', ') || 'none'
      }`
    );
  }

  const data = { status };
  if (status === 'COMPLETED') data.completedAt = new Date();

  const review = await prisma.performanceReview.update({
    where: { id: req.params.id },
    data,
    include: reviewInclude,
  });
  res.json(review);
});

export const upsertCriteria = asyncHandler(async (req, res) => {
  const { scores } = req.body;
  if (!Array.isArray(scores) || scores.length === 0) {
    throw new HttpError(400, 'scores array is required');
  }
  const reviewId = req.params.id;
  const review = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Review not found');

  await prisma.$transaction(
    scores.map((s) =>
      prisma.reviewCriteriaScore.upsert({
        where: { reviewId_criterion: { reviewId, criterion: s.criterion } },
        update: { score: s.score, comments: s.comments },
        create: { reviewId, criterion: s.criterion, score: s.score, comments: s.comments },
      })
    )
  );

  // Recompute overall rating
  const allScores = await prisma.reviewCriteriaScore.findMany({ where: { reviewId } });
  await prisma.performanceReview.update({
    where: { id: reviewId },
    data: { overallRating: computeOverall(allScores) },
  });

  const updated = await prisma.performanceReview.findUnique({
    where: { id: reviewId },
    include: reviewInclude,
  });
  res.json(updated);
});

export const selfAssess = asyncHandler(async (req, res) => {
  const { selfAssessmentText } = req.body;
  if (!selfAssessmentText?.trim()) throw new HttpError(400, 'selfAssessmentText is required');

  const existing = await prisma.performanceReview.findUnique({
    where: { id: req.params.id },
    include: { reviewee: true },
  });
  if (!existing) throw new HttpError(404, 'Review not found');

  const staffId = req.user.staff?.id;
  if (!staffId || staffId !== existing.revieweeId) {
    throw new HttpError(403, 'Only the reviewee can submit a self-assessment');
  }
  if (existing.status !== 'SELF_ASSESSMENT_PENDING') {
    throw new HttpError(400, 'Self-assessment is only allowed when review status is Self Assessment Pending');
  }

  const review = await prisma.performanceReview.update({
    where: { id: req.params.id },
    data: { selfAssessmentText: selfAssessmentText.trim(), selfSubmittedAt: new Date() },
    include: reviewInclude,
  });
  res.json(review);
});
