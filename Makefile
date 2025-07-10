# Makefile for 88-API Project
# Provides common commands for development and deployment

.PHONY: help dev build test clean deploy-local deploy-prod logs status cleanup

# Default target
help:
	@echo "88-API Project Makefile"
	@echo "======================"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development servers (backend + frontend)"
	@echo "  make build        - Build both backend and frontend"
	@echo "  make test         - Run tests for both backend and frontend"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy-local - Deploy to local Kubernetes cluster"
	@echo "  make deploy-prod  - Deploy to production (requires GitHub Actions)"
	@echo "  make logs         - Show application logs"
	@echo "  make status       - Check deployment status"
	@echo "  make cleanup      - Remove all Kubernetes resources"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-push  - Push Docker images to registry"
	@echo ""

# Development commands
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:4200"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@trap 'kill 0' SIGINT; \
	bun run dev & \
	cd frontend && npm start & \
	wait

build:
	@echo "Building backend..."
	@bun run build
	@echo "Building frontend..."
	@cd frontend && npm run build
	@echo "✅ Build completed"

test:
	@echo "Running backend tests..."
	@bun test
	@echo "Running frontend tests..."
	@cd frontend && npm test -- --watch=false --browsers=ChromeHeadless
	@echo "✅ All tests passed"

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@cd frontend && rm -rf dist/
	@echo "✅ Clean completed"

# Docker commands
docker-build:
	@echo "Building Docker images..."
	@docker build -t 88-api-backend:latest .
	@docker build -t 88-api-frontend:latest ./frontend
	@echo "✅ Docker images built"

docker-push:
	@echo "Pushing Docker images..."
	@docker tag 88-api-backend:latest ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/backend:latest
	@docker tag 88-api-frontend:latest ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/frontend:latest
	@docker push ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/backend:latest
	@docker push ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/')/frontend:latest
	@echo "✅ Docker images pushed"

# Kubernetes deployment commands
deploy-local:
	@echo "Deploying to local Kubernetes cluster..."
	@./scripts/deploy-local.sh deploy

deploy-prod:
	@echo "Production deployment is handled by GitHub Actions"
	@echo "Push to main branch to trigger deployment"

logs:
	@echo "Showing application logs..."
	@./scripts/deploy-local.sh logs

status:
	@echo "Checking deployment status..."
	@./scripts/deploy-local.sh status

cleanup:
	@echo "Cleaning up Kubernetes resources..."
	@./scripts/deploy-local.sh cleanup

# Database commands
db-migrate:
	@echo "Running database migrations..."
	@bun run db:migrate

db-studio:
	@echo "Starting Drizzle Studio..."
	@bun run db:studio

# Utility commands
install:
	@echo "Installing dependencies..."
	@bun install
	@cd frontend && npm install
	@echo "✅ Dependencies installed"

format:
	@echo "Formatting code..."
	@bun fmt
	@cd frontend && npm run format 2>/dev/null || echo "No format script in frontend"
	@echo "✅ Code formatted"

lint:
	@echo "Linting code..."
	@bun lint
	@cd frontend && npm run lint 2>/dev/null || echo "No lint script in frontend"
	@echo "✅ Code linted"

# Health checks
health:
	@echo "Checking application health..."
	@curl -f http://localhost:3000/health || echo "Backend not running"
	@curl -f http://localhost:4200/ || echo "Frontend not running"
	@echo "✅ Health checks completed"

# Development setup
setup:
	@echo "Setting up development environment..."
	@make install
	@make db-migrate
	@echo "✅ Development environment ready"
	@echo ""
	@echo "Next steps:"
	@echo "1. Run 'make dev' to start development servers"
	@echo "2. Run 'make test' to run tests"
	@echo "3. Run 'make deploy-local' to deploy to local Kubernetes" 