# Multi-stage Dockerfile for WATCHDOG backend
# Optimized for Google Cloud Run deployment

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Set PATH to use local pip installations
ENV PATH=/root/.local/bin:$PATH

# Set Python unbuffered mode for proper logging
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN useradd -m -u 1000 watchdog && chown -R watchdog:watchdog /app
USER watchdog

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
