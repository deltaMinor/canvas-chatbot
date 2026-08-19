from datetime import datetime

from django.conf import settings


def update_diagram_generation_progress(
    *,
    project_ad_service,
    project_id: str,
    canvas_id: str,
    user_info: dict,
    percentage: int,
    message: str,
) -> None:
    progress = max(0, min(100, percentage))
    project_ad_service.update_one(
        {"project_id": project_id},
        payload={
            "canvas.$[canvas].llm_generation_status": progress,
            "ref.llm_generation.updated_at": datetime.now(settings.TZINFO).isoformat(),
            "ref.llm_generation.messages": [message],
        },
        array_filters=[
            {"canvas.canvas_id": canvas_id},
        ],
        user_info=user_info,
    )
