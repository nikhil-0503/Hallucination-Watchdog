# Dockerfile for WATCHDOG backend
# Build context MUST be the backend/ directory (set Root Directory = "backend" in Railway)

FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend application code into /app
# When built from backend/ directory, this copies app/, audit/, bias_engine/, etc.
COPY . .

# Set Python unbuffered mode for proper logging
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN useradd -m -u 1000 watchdog && chown -R watchdog:watchdog /app
USER watchdog

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/health', timeout=5)"

# Run FastAPI application
# app.main:app resolves to backend/app/main.py because we are in /app
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
