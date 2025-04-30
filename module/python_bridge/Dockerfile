# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app/modules/python_bridge

# Copy requirements.txt separately first
COPY requirements.txt ./requirements.txt
# (fix typo too: "requirements.txt")
RUN pip install --no-cache-dir -r requirements.txt

# Then copy rest of the files
COPY . .

# Expose port (optional, helps documentation inside docker)
EXPOSE ${PYTHON_PORT}

# Run your Python server
CMD ["python", "app.py"]
