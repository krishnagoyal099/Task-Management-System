import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description:
        'A production-quality REST API for managing tasks with authentication, RBAC, pagination, filtering, and more.',
      contact: {
        name: 'Engineering Team',
        email: 'engineering@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: {
              type: 'string',
              minLength: 8,
              example: 'StrongPass123!',
              description: 'Must contain at least 8 characters, one uppercase, one lowercase, one number',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'StrongPass123!' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200, example: 'Build API' },
            description: { type: 'string', maxLength: 1000, example: 'Implement the REST API endpoints' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], example: 'TODO' },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200, example: 'Build API v2' },
            description: { type: 'string', maxLength: 1000 },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
          },
        },
        TaskResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440001' },
            title: { type: 'string', example: 'Build API' },
            description: { type: 'string', example: 'Implement the REST API endpoints' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], example: 'TODO' },
            userId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Tasks', description: 'Task CRUD operations' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Task Management API Docs',
    }),
  );
};