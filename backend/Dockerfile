# Dockerfile for WATCHDOG backend
# Optimized for Railway deployment

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python unbuffered mode for proper logging
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN useradd -m -u 1000 watchdog && chown -R watchdog:watchdog /app
USER watchdog

# Expose port
EXPOSE 8000

# Health check (uses urllib to avoid requests dependency)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request, os; port=os.getenv('PORT','8000'); urllib.request.urlopen(f'http://localhost:{port}/api/health', timeout=5)"

# Run application from backend directory
WORKDIR /app/backend
CMD exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
