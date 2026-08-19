#!/bin/bash

# MongoDB Collection Creation Script
# This script creates all collections required by the services
# based on the mongo-init.js files from each service

set -e

echo "Starting MongoDB collection creation..."

# Load environment variables from env file
if [ -f "/tmp/mongodb.env" ]; then
    echo "Loading environment variables from /tmp/mongodb.env"
    export $(grep -v '^#' /tmp/mongodb.env | xargs)
else
    echo "Warning: Environment file /tmp/mongodb.env not found"
fi

# Wait a moment for MongoDB to be fully ready
sleep 5

# Create collections using the available MongoDB shell
# Try mongosh first, then fall back to mongo
if command -v mongosh >/dev/null 2>&1; then
    MONGO_CMD="mongosh"
elif command -v mongo >/dev/null 2>&1; then
    MONGO_CMD="mongo"
else
    echo "Error: Neither mongosh nor mongo command found"
    exit 1
fi

echo "Using MongoDB command: $MONGO_CMD"

# Test connection first
echo "Testing MongoDB connection..."
$MONGO_CMD --eval "db.adminCommand('ping')" || {
    echo "Failed to connect to MongoDB, retrying in 5 seconds..."
    sleep 5
    $MONGO_CMD --eval "db.adminCommand('ping')" || {
        echo "Failed to connect to MongoDB after retry"
        exit 1
    }
}

# Create collections using the JavaScript file
echo "Executing collection creation commands..."
$MONGO_CMD /docker-entrypoint-initdb.d/create-collections.js || {
    echo "Failed to create collections, retrying in 10 seconds..."
    sleep 10
    echo "Retrying collection creation..."
    $MONGO_CMD /docker-entrypoint-initdb.d/create-collections.js || echo "Failed to create collections even after retry"
}

echo "MongoDB collection creation completed!"
