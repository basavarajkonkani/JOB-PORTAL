#!/bin/bash

echo "🚀 AI Job Portal - Development Setup"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start database services
echo "📦 Starting PostgreSQL and Redis..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "Database Connection Info:"
echo "  PostgreSQL: localhost:5432"
echo "  Database: jobportal_db"
echo "  User: jobportal"
echo "  Password: jobportal_dev"
echo ""
echo "  Redis: localhost:6379"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development servers"
echo "  2. Frontend: http://localhost:3000"
echo "  3. Backend: http://localhost:3001"
