# Task Management System

A production-quality full-stack Task Management System with Authentication, Role-Based Access Control (RBAC), CRUD operations, API documentation, and a modern frontend dashboard.

## Architecture

```text
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  Frontend   │────▶  │ Backend API  │────▶  │  PostgreSQL  │
│ Next.js 15  │       │ Express.js   │       │   Database   │
│ Port 3000   │       │ Port 5000    │       │  Port 5432   │
└─────────────┘       └──────────────┘       └──────────────┘
```

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, Swagger  
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Axios  
- **Database**: PostgreSQL 16  
- **Infrastructure**: Docker, Docker Compose

## Features

- **Authentication**: JWT-based with bcrypt password hashing
- **RBAC**: User and Admin roles with granular permissions
- **Task CRUD**: Full create, read, update, delete with pagination, filtering, search, sorting
- **Validation**: Zod schema validation on all inputs
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization
- **API Documentation**: Swagger/OpenAPI 3.0 at `/api-docs`
- **API Versioning**: `/api/v1/` prefix with architecture supporting future versions
- **Docker**: Multi-stage builds, health checks, Docker Compose orchestration
- **Testing**: Jest + Supertest integration tests

## Quick Start

### With Docker (Recommended)

```bash
git clone <repo-url>
cd task-management-system
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Swagger Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Manual Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | **Required** |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |

### Frontend

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| **POST** | `/api/v1/auth/register` | No | Register a new user |
| **POST** | `/api/v1/auth/login` | No | Login and get token |
| **GET** | `/api/v1/auth/me` | Yes | Get current user |

### Users (Admin Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| **GET** | `/api/v1/users` | Admin | Get all users |
| **PATCH** | `/api/v1/users/:id/promote` | Admin | Promote user to Admin |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| **POST** | `/api/v1/tasks` | User | Create a task |
| **GET** | `/api/v1/tasks` | User | Get own tasks (Admin: all) |
| **GET** | `/api/v1/tasks/:id` | User | Get a task by ID |
| **PATCH** | `/api/v1/tasks/:id` | User | Update own task |
| **DELETE** | `/api/v1/tasks/:id` | User | Delete own task (Admin: any) |

### Query Parameters for `GET /tasks`

| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (default: 10) |
| `status` | `TODO`, `IN_PROGRESS`, `COMPLETED` | Filter by status |
| `search` | `string` | Search by title (case-insensitive) |
| `sortBy` | `string` | Sort field (default: `createdAt`) |
| `sortOrder`| `asc`, `desc` | Sort direction (default: `desc`) |

---

## Testing

```bash
cd backend
npm test
```

## Deployment

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (minimum 32 characters)
- Use managed PostgreSQL with SSL
- Enable HTTPS with reverse proxy (Nginx/Caddy)
- Set up CI/CD pipeline
- Use container orchestration (Kubernetes/ECS)

## License

MIT
