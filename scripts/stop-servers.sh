#!/bin/bash

BASE_CONTAINER_NAME="server"

echo "Stopping and removing containers..."
docker ps --format "{{.Names}}" | grep "^$BASE_CONTAINER_NAME" | while read -r container; do
    docker stop "$container"
    docker rm "$container"
done

echo "All containers stopped and removed!"