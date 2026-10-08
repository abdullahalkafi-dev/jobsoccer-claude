.PHONY: help prod prod-d down stop restart logs ps build dev dev-d down-dev

COMPOSE_PROD = docker compose -f docker-compose.prod.yml
COMPOSE_DEV  = docker compose -f docker-compose.dev.yml

help:
	@echo "================================================"
	@echo "Jobsoccer Cloud Management Commands"
	@echo "================================================"
	@echo "Production Targets:"
	@echo "  make prod        - Build & start production cluster attached"
	@echo "  make prod-d      - Build & start production cluster in background"
	@echo "  make build       - Pre-build all production images"
	@echo "  make down        - Stop and remove all production containers"
	@echo "  make stop        - Pause all running containers"
	@echo "  make restart     - Restart all production containers"
	@echo "  make logs        - Tail all logs (or 'make logs s=backend')"
	@echo "  make ps          - Show status of all services"
	@echo ""
	@echo "Development Targets:"
	@echo "  make dev         - Start local development environment"
	@echo "  make dev-d       - Start development in background"
	@echo "  make down-dev    - Stop development environment"
	@echo "================================================"

# Production Commands
prod:
	$(COMPOSE_PROD) up --build

prod-d:
	$(COMPOSE_PROD) up --build -d

build:
	$(COMPOSE_PROD) build

down:
	$(COMPOSE_PROD) down

stop:
	$(COMPOSE_PROD) stop

restart:
	$(COMPOSE_PROD) restart

logs:
	$(COMPOSE_PROD) logs -f $(s)

ps:
	$(COMPOSE_PROD) ps

# Development Commands
dev:
	$(COMPOSE_DEV) up --build

dev-d:
	$(COMPOSE_DEV) up --build -d

down-dev:
	$(COMPOSE_DEV) down
