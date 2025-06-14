#!/bin/sh
set -e

# Check if the backend host is resolvable
echo "Checking DNS resolution for backend..."
until ping -c 1 backend > /dev/null 2>&1; do
  echo "Waiting for backend to be resolvable..."
  sleep 2
done
echo "Backend is resolvable!"

# Execute the original command
exec "$@"