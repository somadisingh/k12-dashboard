import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

const noteInclude = { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } };

export const listNotes = asyncHandler(async (req, res) => {
  const { subjectType, subjectId, tag, isPinned } = req.query;
  const where = {};
  if (subjectType) where.subjectType = subjectType;
  if (subjectId) where.subjectId = subjectId;
  if (isPinned !== undefined) where.isPinned = isPinned === 'true';
  if (tag) where.tags = { has: tag };

  const notes = await prisma.note.findMany({
    where,
    include: noteInclude,
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });
  res.json(notes);
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: req.params.id },
    include: noteInclude,
  });
  if (!note) throw new HttpError(404, 'Note not found');
  res.json(note);
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags = [], subjectType = 'GENERAL', subjectId, isPinned = false } = req.body;
  if (!title || !content) throw new HttpError(400, 'title and content are required');
  const authorId = req.user.staff?.id;
  if (!authorId) throw new HttpError(400, 'No staff profile on current user');

  const note = await prisma.note.create({
    data: { title, content, tags, subjectType, subjectId, isPinned, authorId },
    include: noteInclude,
  });
  res.status(201).json(note);
});

export const updateNote = asyncHandler(async (req, res) => {
  const allowed = ['title', 'content', 'tags', 'subjectType', 'subjectId', 'isPinned'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  const note = await prisma.note.update({
    where: { id: req.params.id },
    data,
    include: noteInclude,
  });
  res.json(note);
});

export const deleteNote = asyncHandler(async (req, res) => {
  await prisma.note.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
