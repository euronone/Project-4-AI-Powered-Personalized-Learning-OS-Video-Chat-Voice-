# LearnOS — Developer Makefile
# Requires: Python 3.11+, Node.js 20+, Docker, Supabase CLI
# On Windows use 'nmake' or run commands directly from the shell.

.PHONY: help \
        install-backend dev-backend migrate \
        test-unit test-integration test-backend \
        lint-backend format-backend type-check \
        install-frontend dev-frontend build-frontend \
        test-frontend test-e2e lint-frontend \
        infra-up infra-down \
        supabase-start supabase-stop supabase-status \
        dev test ci clean

# ─────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────
help:
	@echo ""
	@echo "LearnOS — available make targets:"
	@echo ""
	@echo "  Backend"
	@echo "    install-backend      Create venv and install Python dependencies"
	@echo "    dev-backend          Start FastAPI dev server (port 8000)"
	@echo "    migrate              Run Alembic migrations against Supabase DB"
	@echo "    test-unit            Run backend unit tests (no DB/network)"
	@echo "    test-integration     Run backend integration tests (needs supabase-start)"
	@echo "    test-backend         Run ALL backend tests"
	@echo "    lint-backend         Lint backend with ruff"
	@echo "    format-backend       Format backend with ruff"
	@echo "    type-check           Type-check backend with mypy"
	@echo ""
	@echo "  Frontend"
	@echo "    install-frontend     Install Node.js dependencies"
	@echo "    dev-frontend         Start Next.js dev server (port 3000)"
	@echo "    build-frontend       Production build of Next.js app"
	@echo "    test-frontend        Run Vitest unit tests"
	@echo "    test-e2e             Run Playwright end-to-end tests"
	@echo "    lint-frontend        Lint frontend with next lint"
	@echo ""
	@echo "  Infrastructure"
	@echo "    infra-up             Start Redis via Docker Compose"
	@echo "    infra-down           Stop Redis Docker Compose services"
	@echo "    supabase-start       Start Supabase local dev stack"
	@echo "    supabase-stop        Stop Supabase local dev stack"
	@echo "    supabase-status      Show Supabase local dev status"
	@echo ""
	@echo "  Composite"
	@echo "    dev                  Start Redis + backend + frontend concurrently"
	@echo "    test                 Run all unit tests (backend + frontend)"
	@echo "    ci                   Full CI pipeline: lint + type-check + all tests"
	@echo "    clean                Remove build artifacts and caches"
	@echo ""

# ─────────────────────────────────────────────
# Backend
# ─────────────────────────────────────────────
BACKEND_DIR := backend
VENV        := $(BACKEND_DIR)/venv
PYTHON      := $(VENV)/bin/python
PIP         := $(VENV)/bin/pip
PYTEST      := $(VENV)/bin/pytest
RUFF        := $(VENV)/bin/ruff
MYPY        := $(VENV)/bin/mypy
ALEMBIC     := $(VENV)/bin/alembic
UVICORN     := $(VENV)/bin/uvicorn

# Windows compatibility (venv uses Scripts/ not bin/)
ifeq ($(OS),Windows_NT)
PYTHON  := $(BACKEND_DIR)/venv/Scripts/python
PIP     := $(BACKEND_DIR)/venv/Scripts/pip
PYTEST  := $(BACKEND_DIR)/venv/Scripts/pytest
RUFF    := $(BACKEND_DIR)/venv/Scripts/ruff
MYPY    := $(BACKEND_DIR)/venv/Scripts/mypy
ALEMBIC := $(BACKEND_DIR)/venv/Scripts/alembic
UVICORN := $(BACKEND_DIR)/venv/Scripts/uvicorn
endif

install-backend:
	cd $(BACKEND_DIR) && python -m venv venv
	$(PIP) install --upgrade pip
	$(PIP) install -r $(BACKEND_DIR)/requirements.txt

dev-backend:
	cd $(BACKEND_DIR) && $(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	cd $(BACKEND_DIR) && $(ALEMBIC) upgrade head

test-unit:
	cd $(BACKEND_DIR) && $(PYTEST) -v --ignore=tests/integration

test-integration:
	cd $(BACKEND_DIR) && $(PYTEST) -v tests/integration

test-backend:
	cd $(BACKEND_DIR) && $(PYTEST) -v

lint-backend:
	$(RUFF) check $(BACKEND_DIR)/app $(BACKEND_DIR)/tests

format-backend:
	$(RUFF) format $(BACKEND_DIR)/app $(BACKEND_DIR)/tests

type-check:
	$(MYPY) $(BACKEND_DIR)/app --ignore-missing-imports

# ─────────────────────────────────────────────
# Frontend
# ─────────────────────────────────────────────
FRONTEND_DIR := frontend

install-frontend:
	cd $(FRONTEND_DIR) && npm install

dev-frontend:
	cd $(FRONTEND_DIR) && npm run dev

build-frontend:
	cd $(FRONTEND_DIR) && npm run build

test-frontend:
	cd $(FRONTEND_DIR) && npm run test

test-e2e:
	cd $(FRONTEND_DIR) && npm run test:e2e

lint-frontend:
	cd $(FRONTEND_DIR) && npm run lint

# ─────────────────────────────────────────────
# Infrastructure
# ─────────────────────────────────────────────
infra-up:
	docker compose up -d

infra-down:
	docker compose down

supabase-start:
	supabase start

supabase-stop:
	supabase stop

supabase-status:
	supabase status

# ─────────────────────────────────────────────
# Composite targets
# ─────────────────────────────────────────────
dev: infra-up
	@echo "Starting backend and frontend in parallel..."
	@$(MAKE) dev-backend &
	@$(MAKE) dev-frontend

test: test-unit test-frontend

ci: lint-backend format-backend type-check test-unit lint-frontend build-frontend

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/out 2>/dev/null || true
	@echo "Clean complete."
