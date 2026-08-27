import logging
import uuid

from celery import Celery
from django.conf import settings
from service.lib.diagram_llm_job_util import DiagramLLMJobUtil

from shared_libs.decorators import raise_exception
from shared_libs.domain import ProjectRegisterService
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel
from shared_libs.producers.llm_producer import LLMProducer
from shared_libs.producers.producer_data import (
    producer_data_diagram_pipeline_topology,
    producer_data_project_register,
)
from shared_libs.constants import SYSTEM_USER_INFO

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)


class ProjectRegisterApplicationService(ProjectRegisterService):
    def __init__(
        self,
        celery_app: Celery,
        *args,
        **kwargs,
    ):
        self.celery_app = celery_app
        super().__init__(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_register,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        from .project_ad import ProjectADApplicationService

        self.project_ad_service = ProjectADApplicationService(
            *args,
            celery_app=celery_app,
            **kwargs,
        )

    def _ensure_no_active_llm_generation(
        self,
        *,
        project_id: str,
        user_info: dict,
    ) -> None:
        """Raise if a generation is already running, and auto-recover stale state.

        Checks in order:
        1. Active heartbeat  → pipeline is alive, block immediately.
        2. DB state "running" with no heartbeat → pipeline worker died, auto-fail.
        3. Stale reservation with no heartbeat → pipeline never picked up, clear it.
        """
        active_heartbeat = DiagramLLMJobUtil.get_active_heartbeat(project_id)
        if active_heartbeat is not None:
            raise BadRequest(
                "An LLM generation is already running for this project. "
                "Please wait for completion."
            )

        project_ad = self.project_ad_service.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=user_info,
        )
        generation = (project_ad.get("ref") or {}).get("llm_generation") or {}
        generation_state = (generation.get("state") or "").strip().lower()

        if generation_state == "running":
            # Heartbeat is gone but DB still shows running — worker died.
            logger.warning(
                "[ AD-SERVICE ] [%s] LLM generation heartbeat expired while DB"
                " state is still 'running'. Auto-failing stale generation.",
                project_id,
            )
            self.project_ad_service.fail_llm_generation(
                project_id=project_id,
                user_info=user_info,
                error="Pipeline worker died unexpectedly. Generation has been auto-aborted.",
            )
            return

        # No heartbeat, no running DB state — check for a stale reservation
        # (pipeline was dispatched but never picked up from the queue).
        if DiagramLLMJobUtil.is_start_reservation_stale(project_id):
            logger.warning(
                "[ AD-SERVICE ] [%s] Stale diagram generation reservation found."
                " Clearing it so a new generation can start.",
                project_id,
            )
            DiagramLLMJobUtil.clear_start_reservation(project_id)

    @raise_exception(
        "Failed to infer architecture topology using LLM.",
        exception_logger=logger,
    )
    def infer_llm_topology_architecture(
        self,
        data: dict,
    ) -> str:
        project_id: str = data["project_id"]
        canvas_id: str = data["canvas_id"]
        file_id: str = data["file_id"]

        self._ensure_no_active_llm_generation(
            project_id=project_id,
            user_info=SYSTEM_USER_INFO,
        )

        generation_id = str(uuid.uuid4())
        reserved = DiagramLLMJobUtil.reserve_start(
            project_id=project_id,
            job_id=generation_id,
        )
        if not reserved:
            raise BadRequest(
                "An LLM generation is already starting for this project. "
                "Please wait for completion."
            )

        diagram_pipeline_producer = LLMProducer(
            producer=Producer(
                producer_data_model=ProducerDataModel(
                    **producer_data_diagram_pipeline_topology,
                ),
                celery_app=self.celery_app,
            )
        )
        task_id = diagram_pipeline_producer.run_async(
            task_type="run_pipeline",
            project_id=project_id,
            canvas_id=canvas_id,
            file_id=file_id,
            job_id=generation_id,
            user_info=SYSTEM_USER_INFO,
        )
        self.project_ad_service.start_llm_generation(
            project_id=project_id,
            canvas_id=canvas_id,
            task_id=task_id,
            generation_type="topology",
            user_info=SYSTEM_USER_INFO,
        )
        return task_id

