#!/bin/bash
set -euo pipefail

# Imports the demo seed data (a couple of example architecture diagrams and
# the TOSCA knowledge base the diagram canvas needs) so there's something to
# look at immediately after setup, instead of starting from a blank canvas.

exec 1> >(tee -a /docker-entrypoint-initdb.d/init.log) 2>&1
set -x

host="127.0.0.1"
port="27017"
adDbName="${AD_DB_NAME:-tm_ad_db}"

until nc -z "$host" "$port"; do
    echo "MongoDB is unavailable - sleeping"
    sleep 1
done

echo "Importing seed data into $adDbName..."

mongoimport --host "$host" --port "$port" \
    --db "$adDbName" --collection project_ad \
    --file /docker-entrypoint-initdb.d/data/project_ads.json --jsonArray

mongoimport --host "$host" --port "$port" \
    --db "$adDbName" --collection kb_tosca \
    --file /docker-entrypoint-initdb.d/data/kb_tosca.json

echo "Seed data import completed."
