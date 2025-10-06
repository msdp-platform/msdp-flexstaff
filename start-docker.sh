#!/bin/bash

echo "🚀 Starting FlexStaff Application in Docker..."

# Start PostgreSQL and Redis
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for PostgreSQL and Redis to be ready..."
sleep 20

# Build and start backend
echo "🔧 Building and starting backend..."
docker-compose up --build -d backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 30

# Build and start frontend
echo "🎨 Building and starting frontend..."
docker-compose up --build -d frontend

# Build and start admin
echo "⚙️  Building and starting admin dashboard..."
docker-compose up --build -d admin

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Access your applications at:"
echo "   - Backend API:      http://localhost:4000"
echo "   - Frontend Web:     http://localhost:5173"
echo "   - Admin Dashboard:  http://localhost:5174"
echo "   - PostgreSQL:       localhost:5433"
echo "   - Redis:            localhost:6380"
echo ""
echo "📊 Check logs with: docker-compose logs -f [service-name]"
echo "🛑 Stop all with: docker-compose down"
