FROM python:3.12-slim

# Set environment variables
ENV POETRY_VERSION=2.0.0 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    build-essential \
    libffi-dev \
    libssl-dev \
    curl \
    && pip install --no-cache-dir poetry==$POETRY_VERSION \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency files first for caching
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN poetry install --no-root --no-interaction --no-ansi

# Copy the rest of the application code
COPY . /app/

# Run the application
CMD ["poetry", "run", "asset-processing-service"]
