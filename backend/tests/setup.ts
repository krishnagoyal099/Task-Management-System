import prisma from '../src/utils/prisma';

export const cleanDatabase = async (): Promise<void> => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export const createTestUser = async (overrides: {
  name?: string;
  email?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
} = {}) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(overrides.password || 'Password123', 12);

  return prisma.user.create({
    data: {
      name: overrides.name || 'Test User',
      email: overrides.email || `test-${Date.now()}@example.com`,
      password: hashedPassword,
      role: overrides.role || 'USER',
    },
  });
};