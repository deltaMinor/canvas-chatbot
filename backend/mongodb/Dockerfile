FROM public.ecr.aws/docker/library/mongo:latest

# Build argument for environment file
ARG ENV_FILE

# deps for download + utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates dos2unix netcat-openbsd gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Copy environment file (will be deleted after initialization)
COPY ${ENV_FILE} /tmp/mongodb.env

# Change ownership to mongodb user so cleanup script can delete it
RUN chown mongodb:mongodb /tmp/mongodb.env

# Init scripts (ensure order: 00* runs before 01*, 01* runs before 02*, etc.)
COPY mongodb/scripts/create_databases.sh /docker-entrypoint-initdb.d/00-create-databases.sh
COPY mongodb/scripts/create_databases.js /docker-entrypoint-initdb.d/create_databases.js
COPY mongodb/scripts/create-collections.sh /docker-entrypoint-initdb.d/02-create-collections.sh
COPY mongodb/scripts/create-collections.js /docker-entrypoint-initdb.d/create-collections.js
COPY mongodb/scripts/import-data.sh /docker-entrypoint-initdb.d/03-import-data.sh
COPY mongodb/scripts/cleanup.sh /docker-entrypoint-initdb.d/04-cleanup.sh

# Copy seed data (a couple of example diagrams + the TOSCA knowledge base)
COPY mongodb/data/diagram_service /docker-entrypoint-initdb.d/data

RUN chmod 777 /docker-entrypoint-initdb.d

RUN chmod +x /docker-entrypoint-initdb.d/00-create-databases.sh \
    && dos2unix /docker-entrypoint-initdb.d/00-create-databases.sh

RUN chmod +x /docker-entrypoint-initdb.d/02-create-collections.sh \
    && dos2unix /docker-entrypoint-initdb.d/02-create-collections.sh

RUN chmod +x /docker-entrypoint-initdb.d/03-import-data.sh \
    && dos2unix /docker-entrypoint-initdb.d/03-import-data.sh

RUN chmod +x /docker-entrypoint-initdb.d/04-cleanup.sh \
    && dos2unix /docker-entrypoint-initdb.d/04-cleanup.sh

# Expose the default MongoDB port
EXPOSE 27017
