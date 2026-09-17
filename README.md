# Diagram Canvas Chatbot Demo

This is a stripped-down copy of `tm-project`, focused entirely on **the
diagram canvas chatbot**: a chat panel that sits alongside an architecture
diagram canvas and can drive it.

## Technologies Used

- Django + Django REST Framework
- MongoDB
- Redis
- RabbitMQ
- React + TypeScript

## Prerequisites

- Docker (for MongoDB + Redis + RabbitMQ + the backend)
- Python 3.10-3.13 and [`uv`](https://docs.astral.sh/uv/)
- Node.js 22+ and npm

## Backend Setup

**1. Start MongoDB, Redis, and RabbitMQ:**

```bash
cd backend
docker compose up -d tm-mongodb tm-redis tm-rabbitmq
```

**2. Run the Django app (a web server + a Celery worker) directly:**

```bash
cd diagram_service
cp ../.backend.local.dev.env .env
uv sync --frozen
uv run python -m scripts.uvicorn.server
```

In a separate terminal, start a Celery worker:
```bash
uv run celery -A main worker -Q diagram_queue --loglevel=info --pool=gevent --concurrency=10
```

### IntentRX Setup

The chatbot bridges to IntentRX, a separate CLI tool
that is **not included in this repository** and must be supplied separately.
Without it, the chatbot will still open and respond to `/help`, but any
`/start onto|intent|topology` command will say the session can't be started.

1.  Copy IntentRX's contents into `backend/intentrx`.
2.  From `backend/intentrx`, run `uv sync`. This creates
    `backend/intentrx/.venv`, which is where the chatbot bridge looks for
    IntentRX's Python interpreter by default.
3.  Create `backend/intentrx/.secret.env` with your own API key and the
    Mongo connection details (auth is disabled in this demo, so no
    username/password is needed; port `39017` matches the default in
    `docker-compose.yml` above - adjust if you remapped it):

    ```dotenv
    OPENAI_APIKEY=your_key

    DB_HOST=localhost
    DB_PORT=39017
    DB_NAME=tm_ad_db
    DB_COLLECTION_NAME=project_ad_file
    ```

    See `backend/intentrx/README.md` (once copied in) for the full list of
    supported environment variables.
    
    > **Warning:**
    > Do not include `DB_USERNAME` or `DB_PASSWORD` in `backend/intentrx/.secret.env` 

No further steps are needed - once `.venv` and `.secret.env` exist, typing
`/start intent` (etc.) into the chatbot will launch IntentRX for that
session, and `:quit` will end it.

If IntentRX is ever moved elsewhere, or run with a different interpreter,
set the `INTENTRX_ROOT` and/or `INTENTRX_PYTHON` environment variables for
the `diagram_service` backend process instead of moving the default paths.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:39173`. The dev server proxies `/api/*` requests
straight to the backend on `http://localhost:39006` (see `vite.config.mts`);
change `VITE_API_PROXY_TARGET` in `.env` if your backend runs elsewhere.

## Subsequent Usage

Once set up, day-to-day usage is just:

### Terminal 1
```bash
cd backend
docker compose up -d tm-mongodb tm-redis tm-rabbitmq
cd diagram_service
uv run python -m scripts.uvicorn.server
```

### Terminal 2
```bash
cd backend/diagram_service
uv run celery -A main worker -Q diagram_queue --loglevel=info --pool=gevent --concurrency=10
```

### Terminal 3
```bash
cd frontend
npm run dev
```

# Using the chatbot

Open `http://localhost:39173` (a single fixed demo project loads
automatically - there is no project list). Click the chat icon on the
diagram canvas to open the chatbot panel.

## Features
- Allows interaction with IntentRX via chatbot
- Custom TopologyGenerator process with the following setup options:
  - Continue from previous run
  - Import from current project database
  - Upload PDF file
- Mock user/admin account system
- PDF storage separated by account
- Diagrams can be exported as JSON, PNG or draw.io file format
- All generated diagrams are saved, and can be deleted or have their file names edited
- Daily quota system and total diagram generated tracking
- Quotas can be managed by an admin via the "Admin" dialog

## Commands

- `/start onto` - starts an OntoPilot session
- `/start intent` - starts an IntentRX session
- `/start topology` - starts a customised TopologyGenerator session
- `/clear chat` - clears chat history
- `/clear diagram` - clears the canvas diagram
- `/clear all` - clears both chat history and the canvas diagram
- `/help` - lists available commands

In addition, the following commands are also available for debugging purposes:
- `/runs` - view all run contexts in the current conversation
- `/start topodebug` - starts a TopologyGenerator session in its initial state without filter
- `/import` - attach a diagram json file with this command to directly import it onto the canvas

### Quick Start
Below are steps you can take to quickly parse a diagram PDF into a draw.io file

1. Import the diagram PDF via the "Import PDF" dialog
2. Start a TopologyGenerator by inputting "/start topology" in the chatbot
3. Select "Import from current project database" with input "2"
4. Select the most recently uploaded PDF
5. Input "yes" until diagram is fully parsed and a diagram is generated
6. Click on the "Import Diagram" button to import the diagram into the canvas
7. Select "drawio(XML)" from the "Export" dialog and confirm to download the diagrma as a draw.io file
