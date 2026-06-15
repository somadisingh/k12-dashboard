import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { staff: { include: { department: true } } },
  });

  if (!user || !user.isActive) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      staff: user.staff,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { staff: { include: { department: true, school: true } } },
  });
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    staff: user.staff,
  });
});
