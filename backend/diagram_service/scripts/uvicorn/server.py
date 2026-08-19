import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import uvicorn
from uvicorn.importer import import_from_string

from .config import (
    CUSTOM_LOGGING,
    UVICORN_APP,
    UVICORN_HOST,
    UVICORN_INNER_APP,
    UVICORN_LOG_LEVEL,
    UVICORN_PORT,
    UVICORN_THREAD_POOL_WORKERS,
    UVICORN_TIMEOUT_GRACEFUL_SHUTDOWN,
    UVICORN_TIMEOUT_KEEP_ALIVE,
    UVICORN_WORKERS,
)


class ThreadPoolConfiguredASGIApp:
    def __init__(self, app: Any, max_workers: int):
        self.app = app
        self.max_workers = max_workers
        self.executor: ThreadPoolExecutor | None = None

    def configure_executor(self) -> None:
        if self.executor is not None:
            return
        self.executor = ThreadPoolExecutor(
            max_workers=self.max_workers,
            thread_name_prefix="uvicorn-default-executor",
        )
        asyncio.get_running_loop().set_default_executor(self.executor)

    async def __call__(self, scope, receive, send):
        self.configure_executor()
        await self.app(scope, receive, send)


def create_application():
    return ThreadPoolConfiguredASGIApp(
        app=import_from_string(UVICORN_INNER_APP),
        max_workers=UVICORN_THREAD_POOL_WORKERS,
    )


def main():
    uvicorn.run(
        UVICORN_APP,
        host=UVICORN_HOST,
        port=UVICORN_PORT,
        workers=UVICORN_WORKERS,
        timeout_keep_alive=UVICORN_TIMEOUT_KEEP_ALIVE,
        timeout_graceful_shutdown=UVICORN_TIMEOUT_GRACEFUL_SHUTDOWN,
        log_level=UVICORN_LOG_LEVEL,
        log_config=CUSTOM_LOGGING,
        proxy_headers=True,
        forwarded_allow_ips="*",
        factory=UVICORN_APP.endswith(":create_application"),
    )


if __name__ == "__main__":
    main()
