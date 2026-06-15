import prisma from '../utils/prismaClient.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getKpis = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalStaff, observationsThisMonth, observationsLastMonth, pendingReviews, allScores] =
    await Promise.all([
      prisma.staff.count({ where: { isActive: true } }),
      prisma.observation.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.observation.count({
        where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      prisma.performanceReview.count({
        where: { status: { notIn: ['COMPLETED'] } },
      }),
      prisma.observationRubricScore.findMany({ select: { score: true } }),
    ]);

  // Goals at risk: status AT_RISK, or ACTIVE with target date within 7 days
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const goalsAtRisk = await prisma.goal.count({
    where: {
      OR: [
        { status: 'AT_RISK' },
        { status: 'ACTIVE', targetDate: { lte: soon } },
      ],
    },
  });

  const avgObservationScore = allScores.length
    ? Math.round((allScores.reduce((a, s) => a + s.score, 0) / allScores.length) * 100) / 100
    : null;

  res.json({
    totalStaff,
    observationsThisMonth,
    observationsLastMonth,
    observationChange: observationsThisMonth - observationsLastMonth,
    pendingReviews,
    goalsAtRisk,
    avgObservationScore,
  });
});

export const getTrend = asyncHandler(async (req, res) => {
  const now = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const observations = await prisma.observation.findMany({
      where: { scheduledDate: { gte: start, lt: end } },
      include: { rubricScores: true },
    });

    const scores = observations.flatMap((o) => o.rubricScores.map((s) => s.score));
    const avgScore = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0;

    result.push({
      month: MONTHS[start.getMonth()],
      count: observations.length,
      avgScore,
    });
  }

  res.json(result);
});

export const getPerformance = asyncHandler(async (req, res) => {
  // Average per rubric category
  const scores = await prisma.observationRubricScore.findMany({
    include: { observation: { include: { teacher: { include: { department: true } } } } },
  });

  const byCategory = {};
  const byDepartment = {};

  for (const s of scores) {
    byCategory[s.category] = byCategory[s.category] || { total: 0, count: 0 };
    byCategory[s.category].total += s.score;
    byCategory[s.category].count += 1;

    const dept = s.observation?.teacher?.department?.name || 'Unassigned';
    byDepartment[dept] = byDepartment[dept] || { total: 0, count: 0 };
    byDepartment[dept].total += s.score;
    byDepartment[dept].count += 1;
  }

  const categories = Object.entries(byCategory).map(([category, v]) => ({
    category,
    avgScore: Math.round((v.total / v.count) * 100) / 100,
  }));
  const departments = Object.entries(byDepartment).map(([department, v]) => ({
    department,
    avgScore: Math.round((v.total / v.count) * 100) / 100,
  }));

  // Review status distribution (for the pie chart)
  const reviews = await prisma.performanceReview.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  const reviewStatusDistribution = reviews.map((r) => ({
    status: r.status,
    count: r._count.status,
  }));

  res.json({ categories, departments, reviewStatusDistribution });
});

export const getActivity = asyncHandler(async (req, res) => {
  const [observations, reviews, goals, notes] = await Promise.all([
    prisma.observation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 15,
      include: { teacher: true, observer: true },
    }),
    prisma.performanceReview.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 15,
      include: { reviewee: true, reviewer: true },
    }),
    prisma.goal.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 15,
      include: { assignments: { include: { staff: true } } },
    }),
    prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 15,
      include: { author: true },
    }),
  ]);

  const events = [
    ...observations.map((o) => ({
      type: 'OBSERVATION',
      id: o.id,
      title: `Observation of ${o.teacher.firstName} ${o.teacher.lastName}`,
      subtitle: `${o.subject} · ${o.status.replace(/_/g, ' ')}`,
      status: o.status,
      date: o.updatedAt,
    })),
    ...reviews.map((r) => ({
      type: 'REVIEW',
      id: r.id,
      title: `Review of ${r.reviewee.firstName} ${r.reviewee.lastName}`,
      subtitle: `${r.reviewPeriod} · ${r.status.replace(/_/g, ' ')}`,
      status: r.status,
      date: r.updatedAt,
    })),
    ...goals.map((g) => ({
      type: 'GOAL',
      id: g.id,
      title: g.title,
      subtitle: `Goal · ${g.status.replace(/_/g, ' ')}`,
      status: g.status,
      date: g.updatedAt,
    })),
    ...notes.map((n) => ({
      type: 'NOTE',
      id: n.id,
      title: n.title,
      subtitle: `Note by ${n.author.firstName} ${n.author.lastName}`,
      status: null,
      date: n.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  res.json(events);
});

export const getUpcoming = asyncHandler(async (req, res) => {
  const now = new Date();
  const in14 = new Date();
  in14.setDate(in14.getDate() + 14);

  const [observations, reviews] = await Promise.all([
    prisma.observation.findMany({
      where: {
        scheduledDate: { gte: now, lte: in14 },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      include: { teacher: true },
      orderBy: { scheduledDate: 'asc' },
    }),
    prisma.performanceReview.findMany({
      where: {
        meetingDate: { gte: now, lte: in14 },
        status: { notIn: ['COMPLETED'] },
      },
      include: { reviewee: true },
      orderBy: { meetingDate: 'asc' },
    }),
  ]);

  const items = [
    ...observations.map((o) => ({
      type: 'OBSERVATION',
      id: o.id,
      title: `${o.teacher.firstName} ${o.teacher.lastName} — ${o.subject}`,
      date: o.scheduledDate,
    })),
    ...reviews.map((r) => ({
      type: 'REVIEW',
      id: r.id,
      title: `${r.reviewee.firstName} ${r.reviewee.lastName} — Review Meeting`,
      date: r.meetingDate,
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json(items);
});
