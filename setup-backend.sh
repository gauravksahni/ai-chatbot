#!/bin/bash

# Define directories
dirs=(
  "backend/app/api"
  "backend/app/core"
  "backend/app/db"
  "backend/app/models"
  "backend/app/schemas"
  "backend/app/services"
  "backend/app/utils"
  "backend/alembic/versions"
  "backend/migrations"
  "backend/tests/test_api"
)

# Define files
files=(
  "backend/app/api/__init__.py"
  "backend/app/api/auth.py"
  "backend/app/api/chat.py"
  "backend/app/api/dependencies.py"
  "backend/app/api/websockets.py"

  "backend/app/core/__init__.py"
  "backend/app/core/config.py"
  "backend/app/core/logging.py"
  "backend/app/core/security.py"

  "backend/app/db/__init__.py"
  "backend/app/db/elasticsearch.py"
  "backend/app/db/postgresql.py"

  "backend/app/models/__init__.py"
  "backend/app/models/chat.py"
  "backend/app/models/user.py"

  "backend/app/schemas/__init__.py"
  "backend/app/schemas/chat.py"
  "backend/app/schemas/user.py"

  "backend/app/services/__init__.py"
  "backend/app/services/auth.py"
  "backend/app/services/chat.py"
  "backend/app/services/claude.py"

  "backend/app/utils/__init__.py"
  "backend/app/utils/rate_limiter.py"

  "backend/app/__init__.py"
  "backend/app/main.py"

  "backend/alembic/env.py"
  "backend/alembic/README"
  "backend/alembic/script.py.mako"

  "backend/tests/__init__.py"
  "backend/tests/conftest.py"
  "backend/tests/test_api/__init__.py"
  "backend/tests/test_api/test_auth.py"
  "backend/tests/test_api/test_chat.py"

  "backend/.env.example"
  "backend/.flake8"
  "backend/.gitignore"
  "backend/alembic.ini"
  "backend/Dockerfile"
  "backend/pyproject.toml"
  "backend/requirements-dev.txt"
  "backend/requirements.txt"
)

# Create directories
echo "Creating directories..."
for dir in "${dirs[@]}"; do
  mkdir -p "$dir"
done

# Create files
echo "Creating files..."
for file in "${files[@]}"; do
  touch "$file"
done

echo "Project structure created successfully!"
