import os


def get_task_modules_for_worker(
    task_modules_by_queue: dict[str, list[str]],
) -> list[str]:
    worker_queue = os.environ.get("WORKER_QUEUE")
    if not worker_queue:
        return [
            module for modules in task_modules_by_queue.values() for module in modules
        ]

    task_modules: list[str] = []
    for queue in [queue.strip() for queue in worker_queue.split(",") if queue.strip()]:
        task_modules.extend(task_modules_by_queue.get(queue, []))

    return list(dict.fromkeys(task_modules))
