# Diagram Canvas Chatbot Demo

This is a stripped-down copy of `tm-project`, focused entirely on **the
diagram canvas chatbot**: a chat panel that sits alongside an architecture
diagram canvas and can drive it (starting AI-assisted sessions, generating
topologies from a PDF upload, and editing the canvas directly from chat).

Everything not required to demonstrate that feature has been removed,
including: multiple projects/dashboard, the Data Flow and Summary canvas
sections, the resource drawer, the diagram Tutorial/Import/Export/Clear/Logs/
Submit toolbar, the non-chatbot diagram-setup import options (XML/IaC/Image/
JSON/Cacti/Template/Natural-language), and user authentication (the backend
already ran with a hardcoded dev-bypass user; this build keeps that, with no
login screen). The backend has also been collapsed from several
microservices (`application_service` and `diagram_service`, each with their
own web + worker processes) down to a single Django codebase (`diagram_service`)
running as two processes - a web server and one Celery worker.

**Note on RabbitMQ:** this demo originally tried to also drop RabbitMQ, by
running Celery in "always eager" mode. That doesn't work here - this
codebase's data-access layer dispatches every MongoDB read/write as a Celery
task via `send_task(name, ...)` (by task name, not by calling `.delay()` on
an imported task object), and Celery's eager mode has no effect on
`send_task` - it still requires a real, reachable broker and a worker
actually consuming the queue. So RabbitMQ (and one worker process) are kept,
verified end-to-end while putting this together.

## Technologies Used

- Django + Django REST Framework (single backend codebase, run as a web
  process + one Celery worker process)
- MongoDB (direct, no auth by default - browsable in MongoDB Compass)
- Redis (task result backend, and required by the auth-bypass decorator,
  which pings it at import time)
- RabbitMQ (Celery broker - see the note above)
- React + TypeScript (Vite)
- IntentRX (external AI CLI tool the chatbot bridges to - not included, see below)

## Prerequisites

- Docker (for MongoDB + Redis + RabbitMQ + the backend)
- Python 3.10-3.13 and [`uv`](https://docs.astral.sh/uv/) (only needed if
  you want to run the backend outside Docker)
- Node.js 22+ and npm

## Backend Setup

The chatbot's AI sessions run via IntentRX as a real subprocess spawned by
the Django web process (see "How the chatbot talks to IntentRX" below), so
if you want that to work, the Django process needs a filesystem path to
IntentRX's own virtualenv - which is easiest to arrange by running it
directly on your machine rather than inside a container. If you just want
to see the app running (chatbot commands like `/help` will work; commands
like `/start intent` will report the session can't be started), Docker
alone is enough.

**1. Start MongoDB, Redis, and RabbitMQ:**

```bash
cd backend
docker compose up -d tm-mongodb tm-redis tm-rabbitmq
```

This demo's default ports are deliberately shifted into the `39xxx` range
(MongoDB `39017`, Redis `39379`, RabbitMQ `39672`/`39682`, backend `39006`,
frontend `39173`) instead of each service's usual default, specifically so
it won't collide with a full/original `tm-project` checkout - or anything
else - already running on the same machine.

- MongoDB is exposed on `localhost:39017` with no authentication, so you can
  connect to it directly in MongoDB Compass to inspect saved diagrams. It's
  seeded on first build with a couple of example diagrams and the TOSCA
  knowledge base the canvas needs.
- RabbitMQ's management UI is on `http://localhost:39682` (guest/guest) if
  you want to watch tasks flow through it. `rabbitmq/rabbitmq.conf` lifts
  RabbitMQ's default restriction of the `guest` account to loopback-only
  connections - without it, connecting from a process running natively on
  your host machine (as in step 2 below) to the container's forwarded port
  gets rejected with `ACCESS_REFUSED`, since RabbitMQ sees that connection
  as coming from the Docker network rather than genuine loopback.

> **Port still already allocated?** If `39xxx` happens to collide with
> something too, `docker ps -a` will show what's already using a port (or
> check directly: `lsof -i :39672` on Mac/Linux, `netstat -ano | findstr
> 39672` on Windows). Remap any of them without editing `docker-compose.yml`
> by creating a `backend/.env` file (which Compose reads automatically) with
> whichever of these you need, e.g.:
>
> ```
> TM_RABBITMQ_HOST_PORT=5673
> ```
>
> (`TM_MONGODB_HOST_PORT`, `TM_REDIS_HOST_PORT`, `TM_RABBITMQ_MANAGEMENT_HOST_PORT`,
> and `TM_BACKEND_HOST_PORT` work the same way.) If you remap a port used by
> a service the backend connects to over `localhost` - i.e. anything other
> than `TM_BACKEND_HOST_PORT` when running the backend outside Docker - update
> the matching URL in `.backend.local.dev.env` to match.

**2. Run the Django app (a web server + a Celery worker) directly:**

```bash
cd diagram_service
cp ../.backend.local.dev.env .env    # Windows/PowerShell: Copy-Item ..\.backend.local.dev.env .env
uv sync --frozen
# Terminal 1 - web server, serves the API on http://localhost:39006
uv run python -m scripts.uvicorn.server
# Terminal 2 - Celery worker
uv run celery -A main worker -Q diagram_queue --loglevel=info --pool=gevent --concurrency=10
```

Both processes automatically load `diagram_service/.env` on startup (via
`python-dotenv`, wired up in `main/settings.py` and, for the web server,
`scripts/uvicorn/config.py` as well) - so the `cp`/`Copy-Item` above is a
one-time step; after that just re-run the two `uv run` commands whenever you
come back to it. If any of MongoDB/Redis/RabbitMQ are running somewhere
other than `localhost` on their default ports, edit the corresponding
`DB_URL_MONGODB` / `REDIS_URL_BASE` / `MQ_URL_BASE_PRIMARY` lines in that
`.env` file.

**Celery pool: always use `--pool=gevent`, on every OS.** This codebase's
data-access layer sometimes calls a Celery task from *inside* another
running Celery task (e.g. a task that logs to the DB via `send_task(...)`
and then blocks on `.get()` for the result). Celery has a built-in
deadlock-prevention guard - `RuntimeError: Never call result.get() within a
task!` - that rejects this pattern for every pool type except `gevent` and
`eventlet`, since only those use cooperative greenlet scheduling where one
blocked call doesn't freeze the whole worker. `gevent` is already declared
as a dependency in `pyproject.toml` (`celery[gevent]`), so no extra install
is needed - just don't drop the `--pool=gevent` flag, and don't fall back to
the Celery default (`prefork`) or to `--pool=solo`, both of which will hit
that RuntimeError as soon as a task tries to synchronously fetch another
task's result.

> **Windows-specific note:** Celery's default `prefork` pool relies on
> `billiard` (a `multiprocessing` fork built around Unix `fork()`), which is
> unstable on Windows - it typically fails immediately with
> `PermissionError: [WinError 5] Access is denied` as each spawned worker
> process dies and gets endlessly respawned. `--pool=gevent` sidesteps this
> entirely (no multiprocessing involved), which is one more reason it's the
> right choice here regardless of the `RuntimeError` above.

**Alternative: everything in Docker.** `docker compose up --build` (from
`backend/`) also builds and runs the Django web server and worker as
containers (`tm-backend`, `tm-worker`), which is simpler but means the
chatbot's IntentRX sessions won't find an IntentRX install unless you also
copy it into the image and rebuild - out of scope for this demo, but
straightforward if you need it (add a `COPY backend/intentrx ...` step and
`uv sync` it in `Dockerfile.diagram_service`). The `tm-worker` service's
`command` in `docker-compose.yml` already includes `--pool=gevent
--concurrency=10` to match the native setup above - see the Celery pool
note above for why that flag is required.

### IntentRX Setup (optional, but required for the chatbot's AI sessions)

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

If you ever need a clean reinstall (e.g. after a dependency conflict), the
`npm run clean:deps` script runs `rimraf node_modules package-lock.json`,
which works cross-platform. If you're clearing those manually instead of
via that script, note that PowerShell's `rm`/`del` aliases don't accept
Unix-style flags like `-rf` - use `Remove-Item -Recurse -Force
node_modules, package-lock.json` instead.

## Subsequent Usage

Once set up, day-to-day usage is just:

```bash
# Terminal 1 (from backend/)
docker compose up -d tm-mongodb tm-redis tm-rabbitmq
cd diagram_service
uv run python -m scripts.uvicorn.server &
uv run celery -A main worker -Q diagram_queue --loglevel=info --pool=gevent --concurrency=10

# Terminal 2
cd frontend && npm run dev
```

(On Windows/PowerShell, run the web server and worker in two separate
terminal windows instead of backgrounding the first with `&`.)

## Using the Chatbot

Open `http://localhost:39173` (a single fixed demo project loads
automatically - there is no project list). Click the chat icon on the
diagram canvas to open the chatbot panel. Available commands:

- `/start onto` - starts an OntoPilot session
- `/start intent` - starts an IntentRX session
- `/start topology` - starts a TopologyGenerator session (can auto-import
  its generated topology onto the canvas)
- `/clear chat` - clears chat history
- `/clear diagram` - clears the canvas diagram
- `/clear all` - clears both chat history and the canvas diagram
- `/help` - lists available commands

You can also start from the diagram-setup dialog shown on an empty canvas,
which offers a PDF-upload option that feeds into the same chatbot-driven
generation flow.

### How the chatbot talks to IntentRX

IntentRX is a blocking, terminal-based CLI tool built around `input()` /
`print()`. Rather than importing it into the Django process, the backend
(`backend/diagram_service/service/application/chatbot/intentrx_bridge/`)
runs it as a real subprocess - `python -m main --app <app>`, using
IntentRX's own virtual environment - and pipes chat messages to and from it,
stripping IntentRX's terminal box-drawing chrome down to readable text. Each
chatbot session (keyed by the frontend's diagram instance id) gets its own
subprocess for the lifetime of the backend process. That subprocess exchange
itself is direct and synchronous, with no broker involved - but the
chatbot's *other* operations (loading/saving the diagram, fetching TOSCA
data, etc.) still go through this codebase's normal Celery-based data layer,
so RabbitMQ and the worker (see above) are still required for those.