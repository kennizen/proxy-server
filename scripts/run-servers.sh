#!/bin/bash

# Number of containers to run (default to 3 if not provided)
NUM_CONTAINERS=${1:-3}
IMAGE_NAME="hello-world-nginx"
BASE_CONTAINER_NAME="server"
BASE_PORT=9000

# Build the Docker image once
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Loop to create multiple containers
for ((i=1; i<=NUM_CONTAINERS; i++)); do
    CONTAINER_NAME="${BASE_CONTAINER_NAME}-${i}"
    PORT=$((BASE_PORT + i))

    echo "Running container $CONTAINER_NAME on port $PORT..."
    docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME
done

echo "All $NUM_CONTAINERS containers are running!"
docker ps