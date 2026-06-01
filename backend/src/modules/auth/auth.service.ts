import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';
import prisma from '../../utils/prisma';
import { RegisterSchema, LoginSchema } from './auth.validation';
import { Role } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

const SALT_ROUNDS = 12;

const generateToken = (userId: string, email: string, role: Role): string => {
  return jwt.sign({ userId, email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const registerUser = async (data: RegisterSchema) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(409, 'A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken(user.id, user.email, user.role);

  return { user, token };
};

export const loginUser = async (data: LoginSchema) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = generateToken(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  return user;
};