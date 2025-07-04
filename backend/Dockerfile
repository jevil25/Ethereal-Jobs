# Use an official Python runtime as the base image
FROM python:3.12.11

# Set working directory in the container
WORKDIR /app

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "${UVICORN_HOST:-0.0.0.0}", "--port", "${UVICORN_PORT:-8000}", "--reload", "--workers", "${UVICORN_WORKERS:-4}"]
