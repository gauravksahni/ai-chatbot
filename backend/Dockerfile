# Base image
FROM python:3.9-slim

WORKDIR /app

# Install system and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    libpq5 \
    netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create scripts directory if not exists and copy start script
RUN mkdir -p /app/scripts
COPY scripts/start.sh /app/scripts/
RUN chmod +x /app/scripts/start.sh



# Expose the application port
EXPOSE 8000

# Start the application 

CMD ["./scripts/start.sh"]
