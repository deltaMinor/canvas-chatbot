#!/bin/bash
set -euo pipefail

# MongoDB Database Creation Shell Script
# This script invokes the create_databases.js script

exec 1> >(tee -a /docker-entrypoint-initdb.d/init.log) 2>&1
set -x

host="127.0.0.1"
port="27017"

# Wait for mongod that entrypoint started for init
until nc -z "$host" "$port"; do
    echo "MongoDB is unavailable - sleeping"
    sleep 1
done
echo "MongoDB is up - creating databases"

# Load credentials from environment file
if [ -f "/tmp/mongodb.env" ]; then
    echo "Loading MongoDB credentials from environment file..."
    set -a  # automatically export all variables
    source "/tmp/mongodb.env"
    set +a  # stop automatically exporting
fi

# Run the database creation script
echo "Creating service databases..."
mongosh --host "$host" --port "$port" --eval "$(cat /docker-entrypoint-initdb.d/create_databases.js)"

echo "Database creation completed."
