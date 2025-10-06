# Docker Setup Guide for FlexStaff

## Port Configuration

Your system has the following ports in use by other services:
- Port 3000, 3001, 3002, 5432 are already occupied

Therefore, FlexStaff is configured to use:
- **Backend API**: `4000` (mapped from container port 3000)
- **Frontend Web**: `5173`
- **Admin Dashboard**: `5174`
- **PostgreSQL**: `5433` (mapped from container port 5432)
- **Redis**: `6380` (mapped from container port 6379)

## Quick Start

### Option 1: Use the Start Script (Recommended)

```bash
./start-docker.sh
```

This script will automatically:
1. Start PostgreSQL and Redis
2. Wait for them to be ready
3. Build and start the backend
4. Build and start the frontend
5. Build and start the admin dashboard

### Option 2: Manual Start

```bash
# 1. Start database services
docker-compose up -d postgres redis

# 2. Wait for databases to be ready (20-30 seconds)
docker-compose ps

# 3. Start backend (this will build first time)
docker-compose up --build -d backend

# 4. Wait for backend to be ready (30 seconds)

# 5. Start frontend and admin
docker-compose up --build -d frontend admin
```

## Access Your Applications

Once all services are running:

- **Backend API**: http://localhost:4000
  - Health check: http://localhost:4000/health
  - API docs: http://localhost:4000/api

- **Frontend Web App**: http://localhost:5173
  - For workers and employers

- **Admin Dashboard**: http://localhost:5174
  - For system administrators

- **Database Access**:
  - PostgreSQL: `localhost:5433`
  - Redis: `localhost:6380`

## Useful Commands

```bash
# View all running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild a specific service
docker-compose up --build -d backend

# Restart a service
docker-compose restart backend
```

## Environment Variables

The `.env` file contains placeholder values for:
- Stripe API keys (replace with real test keys)
- AWS S3 credentials (optional for file uploads)

To use Stripe payments:
1. Get test API keys from https://dashboard.stripe.com/test/apikeys
2. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`
3. Restart backend: `docker-compose restart backend`

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs backend

# Check if ports are available
lsof -i :4000
lsof -i :5173
lsof -i :5174
```

### Database connection issues
```bash
# Verify postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Build is slow
First build takes time (5-10 minutes) as it installs all npm dependencies. Subsequent builds are faster due to Docker layer caching.

### Out of disk space
```bash
# Clean up unused Docker resources
docker system prune -a
```

## Development Workflow

The docker-compose setup includes volume mounts for hot-reloading:

- Changes to `/backend` files will auto-restart backend
- Changes to `/frontend` files will hot-reload frontend
- Changes to `/admin` files will hot-reload admin

No need to rebuild after code changes!

## Database Schema

The database is automatically initialized with the schema from:
`backend/src/database/init.sql`

To reset the database:
```bash
docker-compose down -v
docker-compose up -d postgres redis
# Wait 20 seconds
docker-compose up -d backend
```
