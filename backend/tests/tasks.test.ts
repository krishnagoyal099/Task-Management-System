import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import jwt from 'jsonwebtoken';
import config from '../src/config';
import { cleanDatabase, disconnectDatabase, createTestUser } from './setup';

let userToken: string;
let userId: string;
let adminToken: string;
let adminId: string;

beforeEach(async () => {
  await cleanDatabase();

  const user = await createTestUser({
    name: 'Regular User',
    email: 'user@example.com',
    password: 'Password123',
  });
  userId = user.id;
  userToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
  );

  const admin = await createTestUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Password123',
    role: 'ADMIN',
  });
  adminId = admin.id;
  adminToken = jwt.sign(
    { userId: admin.id, email: admin.email, role: admin.role },
    config.jwtSecret,
  );
});

afterAll(async () => {
  await cleanDatabase();
  await disconnectDatabase();
});

describe('Task Endpoints', () => {
  describe('POST /api/v1/tasks', () => {
    it('should create a task successfully', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Task', description: 'Test description' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.status).toBe('TODO');
      expect(res.body.data.userId).toBe(userId);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Test Task' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for empty title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create task with IN_PROGRESS status', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Active Task', status: 'IN_PROGRESS' });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: 'TODO', userId },
          { title: 'Task 2', status: 'IN_PROGRESS', userId },
          { title: 'Task 3', status: 'COMPLETED', userId },
        ],
      });
    });

    it('should return paginated tasks for user', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(3);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?status=TODO')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.tasks[0].status).toBe('TODO');
    });

    it('should search by title', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?search=Task+1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.tasks[0].title).toBe('Task 1');
    });

    it('should paginate correctly', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });

    it('should return all tasks for admin', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.total).toBe(3);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: { title: 'Original', userId },
      });
      taskId = task.id;
    });

    it('should update own task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated', status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should not update another users task', async () => {
      const otherUser = await createTestUser({
        name: 'Other',
        email: 'other@example.com',
      });
      const otherToken = jwt.sign(
        { userId: otherUser.id, email: otherUser.email, role: otherUser.role },
        config.jwtSecret,
      );

      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to update any task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Admin Updated');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: { title: 'To Delete', userId },
      });
      taskId = task.id;
    });

    it('should delete own task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not delete another users task', async () => {
      const otherUser = await createTestUser({
        name: 'Other2',
        email: 'other2@example.com',
      });
      const otherToken = jwt.sign(
        { userId: otherUser.id, email: otherUser.email, role: otherUser.role },
        config.jwtSecret,
      );

      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to delete any task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .delete('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});