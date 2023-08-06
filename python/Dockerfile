# Use an official Python runtime as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app


RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs
# Install system dependencies (if any) required by the project
# Uncomment and modify the following lines if needed
# RUN apt-get update && apt-get install -y <system-dependency>
RUN npm install -g nodemon

# Copy the setup.cfg file into the container

COPY requirements.txt .


# Install project dependencies
RUN pip install -r ./requirements.txt

# Copy the rest of your project files into the conta


# Set the default command to run when the container starts
CMD python3 src/main.py

