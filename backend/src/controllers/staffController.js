import bcrypt from 'bcryptjs';
import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

// Average rubric score across an array of observations (each with rubricScores)
function avgRubricScore(observations) {
  const scores = observations.flatMap((o) => (o.rubricScores || []).map((s) => s.score));
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export const listStaff = asyncHandler(async (req, res) => {
  const { search, departmentId, isActive } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { position: { contains: search, mode: 'insensitive' } },
    ];
  }

  const staff = await prisma.staff.findMany({
    where,
    include: {
      department: true,
      user: { select: { email: true, role: true } },
      observationsAsTeacher: {
        orderBy: { scheduledDate: 'desc' },
        include: { rubricScores: true },
      },
      reviewsAsReviewee: { orderBy: { createdAt: 'desc' }, take: 1 },
      goals: { include: { goal: true } },
    },
    orderBy: { lastName: 'asc' },
  });

  const result = staff.map((s) => {
    const lastObs = s.observationsAsTeacher[0];
    const activeGoals = s.goals.filter(
      (g) => g.goal.status === 'ACTIVE' || g.goal.status === 'AT_RISK'
    ).length;
    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      position: s.position,
      gradeLevel: s.gradeLevel,
      subjects: s.subjects,
      avatarUrl: s.avatarUrl,
      isActive: s.isActive,
      email: s.user?.email,
      role: s.user?.role,
      department: s.department,
      lastObservedDate: lastObs ? lastObs.observedDate || lastObs.scheduledDate : null,
      activeGoals,
      latestReviewStatus: s.reviewsAsReviewee[0]?.status || null,
      avgObservationScore: avgRubricScore(s.observationsAsTeacher),
    };
  });

  res.json(result);
});

export const getStaff = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findUnique({
    where: { id: req.params.id },
    include: {
      department: true,
      school: true,
      user: { select: { email: true, role: true, isActive: true } },
      observationsAsTeacher: {
        orderBy: { scheduledDate: 'desc' },
        include: { rubricScores: true, observer: true },
      },
      reviewsAsReviewee: {
        orderBy: { createdAt: 'desc' },
        include: { criteriaScores: true, reviewer: true },
      },
      goals: {
        include: {
          goal: { include: { milestones: true, updates: true } },
        },
      },
    },
  });

  if (!staff) throw new HttpError(404, 'Staff member not found');

  const goals = staff.goals.map((g) => g.goal);
  res.json({
    ...staff,
    goals,
    avgObservationScore: avgRubricScore(staff.observationsAsTeacher),
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const {
    email,
    password = 'password123',
    role = 'TEACHER',
    schoolId,
    departmentId,
    firstName,
    lastName,
    position,
    gradeLevel,
    subjects = [],
    hireDate,
    phone,
    bio,
    avatarUrl,
  } = req.body;

  if (!email || !firstName || !lastName || !position) {
    throw new HttpError(400, 'email, firstName, lastName and position are required');
  }

  let resolvedSchoolId = schoolId;
  if (!resolvedSchoolId) {
    const school = await prisma.school.findFirst();
    if (!school) throw new HttpError(400, 'No school exists; cannot create staff');
    resolvedSchoolId = school.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const staff = await prisma.staff.create({
    data: {
      user: {
        create: { email: email.toLowerCase().trim(), passwordHash, role },
      },
      school: { connect: { id: resolvedSchoolId } },
      ...(departmentId ? { department: { connect: { id: departmentId } } } : {}),
      firstName,
      lastName,
      position,
      gradeLevel,
      subjects,
      hireDate: hireDate ? new Date(hireDate) : null,
      phone,
      bio,
      avatarUrl,
    },
    include: { department: true, user: { select: { email: true, role: true } } },
  });

  res.status(201).json(staff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const allowed = [
    'firstName',
    'lastName',
    'position',
    'gradeLevel',
    'subjects',
    'phone',
    'bio',
    'avatarUrl',
    'departmentId',
    'isActive',
  ];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.hireDate !== undefined) {
    data.hireDate = req.body.hireDate ? new Date(req.body.hireDate) : null;
  }

  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data,
    include: { department: true, user: { select: { email: true, role: true } } },
  });
  res.json(staff);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  // Soft delete
  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  await prisma.user.update({
    where: { id: staff.userId },
    data: { isActive: false },
  });
  res.json({ success: true });
});

export const getStaffTimeline = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [observations, reviews, goals, notes] = await Promise.all([
    prisma.observation.findMany({
      where: { teacherId: id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.performanceReview.findMany({
      where: { revieweeId: id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.goal.findMany({
      where: { assignments: { some: { staffId: id } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.note.findMany({
      where: { subjectType: 'STAFF', subjectId: id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const events = [
    ...observations.map((o) => ({
      type: 'OBSERVATION',
      id: o.id,
      title: `Observation: ${o.subject}`,
      status: o.status,
      date: o.createdAt,
    })),
    ...reviews.map((r) => ({
      type: 'REVIEW',
      id: r.id,
      title: `Review: ${r.reviewPeriod}`,
      status: r.status,
      date: r.createdAt,
    })),
    ...goals.map((g) => ({
      type: 'GOAL',
      id: g.id,
      title: `Goal: ${g.title}`,
      status: g.status,
      date: g.createdAt,
    })),
    ...notes.map((n) => ({
      type: 'NOTE',
      id: n.id,
      title: `Note: ${n.title}`,
      status: null,
      date: n.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(events);
});

export const getStaffSummary = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [observations, goals, reviews] = await Promise.all([
    prisma.observation.findMany({
      where: { teacherId: id },
      include: { rubricScores: true },
    }),
    prisma.goal.findMany({ where: { assignments: { some: { staffId: id } } } }),
    prisma.performanceReview.findMany({
      where: { revieweeId: id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({
    observationCount: observations.length,
    avgObservationScore: avgRubricScore(observations),
    goalsCompleted: goals.filter((g) => g.status === 'COMPLETED').length,
    goalsTotal: goals.length,
    latestReviewStatus: reviews[0]?.status || null,
    latestReviewRating: reviews[0]?.overallRating ?? null,
  });
});
