import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

// Legal status transitions for the observation workflow
const TRANSITIONS = {
  SCHEDULED: ['IN_PROGRESS', 'DRAFT'],
  IN_PROGRESS: ['DRAFT', 'SUBMITTED'],
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['TEACHER_ACKNOWLEDGED'],
  TEACHER_ACKNOWLEDGED: ['COMPLETED'],
  COMPLETED: [],
};

const obsInclude = {
  rubricScores: true,
  teacher: { include: { department: true } },
  observer: true,
};

export const listObservations = asyncHandler(async (req, res) => {
  const { teacherId, observerId, status, from, to } = req.query;
  const where = {};
  if (teacherId) where.teacherId = teacherId;
  if (observerId) where.observerId = observerId;
  if (status) where.status = status;
  if (from || to) {
    where.scheduledDate = {};
    if (from) where.scheduledDate.gte = new Date(from);
    if (to) where.scheduledDate.lte = new Date(to);
  }

  const observations = await prisma.observation.findMany({
    where,
    include: obsInclude,
    orderBy: { scheduledDate: 'desc' },
  });
  res.json(observations);
});

export const getObservation = asyncHandler(async (req, res) => {
  const observation = await prisma.observation.findUnique({
    where: { id: req.params.id },
    include: obsInclude,
  });
  if (!observation) throw new HttpError(404, 'Observation not found');
  res.json(observation);
});

export const createObservation = asyncHandler(async (req, res) => {
  const {
    teacherId,
    observerId,
    scheduledDate,
    observedDate,
    duration,
    subject,
    gradeLevel,
    classPeriod,
    studentCount,
    unit,
    status,
    preObsNotes,
    narrativeNotes,
    strengths,
    areasForGrowth,
    actionItems,
  } = req.body;

  if (!teacherId || !scheduledDate || !subject || !gradeLevel) {
    throw new HttpError(400, 'teacherId, scheduledDate, subject and gradeLevel are required');
  }

  // Default observer to the logged-in user's staff profile
  const resolvedObserverId = observerId || req.user.staff?.id;
  if (!resolvedObserverId) {
    throw new HttpError(400, 'observerId is required (no staff profile on current user)');
  }

  const observation = await prisma.observation.create({
    data: {
      teacherId,
      observerId: resolvedObserverId,
      scheduledDate: new Date(scheduledDate),
      observedDate: observedDate ? new Date(observedDate) : null,
      duration: duration ? Number(duration) : null,
      subject,
      gradeLevel,
      classPeriod,
      studentCount: studentCount ? Number(studentCount) : null,
      unit,
      status: status || 'SCHEDULED',
      preObsNotes,
      narrativeNotes,
      strengths,
      areasForGrowth,
      actionItems,
    },
    include: obsInclude,
  });

  res.status(201).json(observation);
});

export const updateObservation = asyncHandler(async (req, res) => {
  const allowed = [
    'subject',
    'gradeLevel',
    'classPeriod',
    'studentCount',
    'unit',
    'duration',
    'preObsNotes',
    'narrativeNotes',
    'strengths',
    'areasForGrowth',
    'actionItems',
    'postObsNotes',
  ];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.scheduledDate !== undefined) data.scheduledDate = new Date(req.body.scheduledDate);
  if (req.body.observedDate !== undefined) {
    data.observedDate = req.body.observedDate ? new Date(req.body.observedDate) : null;
  }
  if (data.studentCount !== undefined && data.studentCount !== null) {
    data.studentCount = Number(data.studentCount);
  }
  if (data.duration !== undefined && data.duration !== null) {
    data.duration = Number(data.duration);
  }

  const observation = await prisma.observation.update({
    where: { id: req.params.id },
    data,
    include: obsInclude,
  });
  res.json(observation);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new HttpError(400, 'status is required');

  const current = await prisma.observation.findUnique({ where: { id: req.params.id } });
  if (!current) throw new HttpError(404, 'Observation not found');

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
  // When moving into a "happened" state, stamp the observed date if missing
  if (
    (status === 'SUBMITTED' || status === 'DRAFT' || status === 'IN_PROGRESS') &&
    !current.observedDate
  ) {
    data.observedDate = new Date();
  }

  const observation = await prisma.observation.update({
    where: { id: req.params.id },
    data,
    include: obsInclude,
  });
  res.json(observation);
});

export const upsertScores = asyncHandler(async (req, res) => {
  const { scores } = req.body;
  if (!Array.isArray(scores) || scores.length === 0) {
    throw new HttpError(400, 'scores array is required');
  }

  const observationId = req.params.id;
  const observation = await prisma.observation.findUnique({ where: { id: observationId } });
  if (!observation) throw new HttpError(404, 'Observation not found');

  await prisma.$transaction(
    scores.map((s) =>
      prisma.observationRubricScore.upsert({
        where: {
          observationId_category: { observationId, category: s.category },
        },
        update: { score: s.score, notes: s.notes },
        create: {
          observationId,
          category: s.category,
          score: s.score,
          notes: s.notes,
        },
      })
    )
  );

  const updated = await prisma.observation.findUnique({
    where: { id: observationId },
    include: obsInclude,
  });
  res.json(updated);
});
