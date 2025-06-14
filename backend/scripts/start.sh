#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z $POSTGRES_SERVER 5432; do
  sleep 1
done
echo "PostgreSQL is up and running"

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch..."
while ! nc -z $ELASTICSEARCH_HOST $ELASTICSEARCH_PORT; do
  sleep 1
done
echo "Elasticsearch is up and running"

# Apply database migrations
echo "Applying database migrations..."
alembic upgrade head

# Start the FastAPI application
echo "Starting the FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000