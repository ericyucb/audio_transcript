FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create and set permissions for the pdfs directory
RUN mkdir -p pdfs && chmod 777 pdfs

# Set production environment
ENV ENVIRONMENT=production

# Expose the port
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Run the application
CMD uvicorn main:app --host=0.0.0.0 --port=${PORT:-8000} 