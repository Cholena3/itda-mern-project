# ITDA Project Management System

A full-stack web application for managing Integrated Tribal Development Agency (ITDA) projects in Parlakhemundi, Gajapati District, Odisha. Built to track government schemes, projects, and works across tribal development blocks.

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Redis, Socket.io, GraphQL (Apollo Server)
**Frontend:** React 19, TypeScript, Material-UI, React Query, Recharts
**Infrastructure:** Docker, GitHub Actions CI/CD, Nginx, Render

## Features

- **Authentication & RBAC** — JWT-based auth with role-based access control (admin/manager/viewer). Granular permissions matrix controlling access at the resource + action level, enforced on both API and UI.
- **Schemes / Projects / Works Management** — Full CRUD with hierarchical data model (Scheme → Project → Work). Location-based filtering by district, block, gram panchayat, and village.
- **Dashboard & Analytics** — Real-time statistics, budget tracking, progress visualization with Recharts, work status distribution.
- **Real-Time Updates** — Socket.io for live notifications, online user tracking, and collaborative awareness.
- **Search** — Full-text search across schemes, projects, and works with natural language query support.
- **Caching** — Redis caching layer with per-resource TTL strategies and smart invalidation.
- **Security** — Rate limiting, input sanitization (XSS/NoSQL injection prevention), Helmet.js security headers, audit logging.
- **API Documentation** — Swagger/OpenAPI 3.0 interactive docs at `/api-docs`.
- **Monitoring** — System health checks, performance metrics, service status dashboard.
- **Photo Management** — Upload and manage work progress photos with Multer.
- **User Management** — Admin panel for managing users, changing roles, and account activation/deactivation.

## Project Structure

```
├── backend/
│   ├── config/          # Redis, Swagger, permissions config
│   ├── graphql/         # GraphQL schema
│   ├── middleware/       # Auth, RBAC, caching, security
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API endpoints
│   ├── services/        # AI, search, socket, tracing services
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # Auth & Socket contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript type definitions
│   └── package.json
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── render.yaml
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT + permissions) |
| GET | `/api/auth/me` | Get current user profile |

### Resources (Schemes, Projects, Works)
All resource endpoints follow REST conventions with RBAC enforcement:
| Method | Action | Admin | Manager | Viewer |
|--------|--------|-------|---------|--------|
| GET | Read | ✅ | ✅ | ✅ |
| POST | Create | ✅ | ✅ | ❌ |
| PUT | Update | ✅ | ✅ | ❌ |
| DELETE | Delete | ✅ | Varies | ❌ |

### Other Endpoints
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/users` — User management (admin/manager)
- `PUT /api/users/:id/role` — Change user role (admin only)
- `POST /api/search/advanced` — Full-text search
- `GET /api/monitoring/metrics` — System metrics
- `GET /health` — Health check

## Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install
cd frontend && npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run in development
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Backend port (default: 5000) |
| `REDIS_URL` | Redis connection URL (optional) |
| `NODE_ENV` | Environment (development/production) |

### Docker

```bash
docker-compose up --build
```

## RBAC Permission Matrix

| Resource | Admin | Manager | Viewer |
|----------|-------|---------|--------|
| Schemes | CRUD | CRU | R |
| Projects | CRUD | CRU | R |
| Works | CRUD | CRUD | R |
| Photos | CRD | CRD | R |
| Users | Full Manage | Read | — |
| Dashboard | Read | Read | Read |
| Monitoring | Read | Read | — |

## License

Proprietary — ITDA Parlakhemundi, Gajapati District, Odisha.
