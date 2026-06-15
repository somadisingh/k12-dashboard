import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

const goalInclude = {
  milestones: { orderBy: { dueDate: 'asc' } },
  updates: { orderBy: { createdAt: 'desc' } },
  assignments: { include: { staff: true } },
};

function withProgress(goal) {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.status === 'COMPLETED').length;
  return {
    ...goal,
    staff: goal.assignments.map((a) => a.staff),
    progress: total ? Math.round((done / total) * 100) : 0,
    milestonesCompleted: done,
    milestonesTotal: total,
  };
}

export const listGoals = asyncHandler(async (req, res) => {
  const { staffId, status, category } = req.query;
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (staffId) where.assignments = { some: { staffId } };

  const goals = await prisma.goal.findMany({
    where,
    include: goalInclude,
    orderBy: { targetDate: 'asc' },
  });
  res.json(goals.map(withProgress));
});

export const getGoal = asyncHandler(async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  if (!goal) throw new HttpError(404, 'Goal not found');

  // Enrich progress updates with author info (no FK relation in schema)
  const authorIds = [...new Set(goal.updates.map((u) => u.authorId))];
  const authors = await prisma.staff.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  });
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));
  const enriched = {
    ...goal,
    updates: goal.updates.map((u) => ({ ...u, author: authorMap[u.authorId] || null })),
  };

  res.json(withProgress(enriched));
});

export const createGoal = asyncHandler(async (req, res) => {
  const { staffId, title, description, category, targetDate } = req.body;
  if (!staffId || !title || !category || !targetDate) {
    throw new HttpError(400, 'staffId, title, category and targetDate are required');
  }
  const createdById = req.user.staff?.id || staffId;

  const goal = await prisma.goal.create({
    data: {
      title,
      description,
      category,
      targetDate: new Date(targetDate),
      assignments: { create: { staffId, createdById } },
    },
    include: goalInclude,
  });
  res.status(201).json(withProgress(goal));
});

export const updateGoal = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'category'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.targetDate !== undefined) data.targetDate = new Date(req.body.targetDate);

  const goal = await prisma.goal.update({
    where: { id: req.params.id },
    data,
    include: goalInclude,
  });
  res.json(withProgress(goal));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new HttpError(400, 'status is required');
  const data = { status };
  if (status === 'COMPLETED') data.completedAt = new Date();

  const goal = await prisma.goal.update({
    where: { id: req.params.id },
    data,
    include: goalInclude,
  });
  res.json(withProgress(goal));
});

export const addMilestone = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title || !dueDate) throw new HttpError(400, 'title and dueDate are required');

  await prisma.goalMilestone.create({
    data: { goalId: req.params.id, title, description, dueDate: new Date(dueDate) },
  });
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  res.status(201).json(withProgress(goal));
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.dueDate !== undefined) data.dueDate = new Date(req.body.dueDate);

  await prisma.goalMilestone.update({ where: { id: req.params.mid }, data });
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  res.json(withProgress(goal));
});

export const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new HttpError(400, 'status is required');
  const data = { status };
  if (status === 'COMPLETED') data.completedAt = new Date();
  else data.completedAt = null;

  await prisma.goalMilestone.update({ where: { id: req.params.mid }, data });

  // Auto-complete the goal if all milestones are done
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  if (
    goal.milestones.length > 0 &&
    goal.milestones.every((m) => m.status === 'COMPLETED') &&
    goal.status !== 'COMPLETED'
  ) {
    await prisma.goal.update({
      where: { id: goal.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  const refreshed = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  res.json(withProgress(refreshed));
});

export const addUpdate = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new HttpError(400, 'content is required');
  const authorId = req.user.staff?.id;
  if (!authorId) throw new HttpError(400, 'No staff profile on current user');

  await prisma.goalProgressUpdate.create({
    data: { goalId: req.params.id, authorId, content },
  });
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: goalInclude,
  });
  res.status(201).json(withProgress(goal));
});
