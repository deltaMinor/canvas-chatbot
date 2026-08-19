import logging
from datetime import datetime, timezone

from celery import Celery

from shared_libs.decorators import raise_exception
from shared_libs.domain import ProjectADService
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.models.base_models import ProducerDataModel, TopologyRunContextBaseModel
from shared_libs.models.database_models import ProjectADModel
from shared_libs.producers.producer_data import producer_data_project_ad

logger = logging.getLogger(__name__)

user_info = {"user_id": "admin_user_id", "username": "admin_username"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class TopologyRunContextApplicationService(ProjectADService):

    def __init__(self, celery_app: Celery, *args, **kwargs):
        super().__init__(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_ad,
                    ),
                    celery_app=celery_app,
                ),
            ),
        )

    def _get_all_runs(self, project_id: str) -> list[dict]:
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=user_info,
        )
        logger.warning(
            "[topology_run_context] fetched doc _id=%r project_id=%r "
            "raw topology_run_context=%r",
            db_project_ad.get("_id"),
            db_project_ad.get("project_id"),
            db_project_ad.get("topology_run_context"),
        )
        project_ad_model = ProjectADModel(**db_project_ad)
        runs = [run.model_dump() for run in (project_ad_model.topology_run_context or [])]
        logger.warning("[topology_run_context] parsed runs=%r", runs)
        return runs

    def _save_all_runs(self, project_id: str, runs: list[dict]) -> dict:
        return self.update_one(
            {"project_id": project_id},
            payload={"topology_run_context": runs},
            user_info=user_info,
        )

    @raise_exception(
        "Failed to list topology run contexts.",
        exception_logger=logger,
    )
    def list_runs(self, data: dict) -> dict:
        """
        Returns:
            dict: { runs: [{conversation_id, run_id, address, created_at}, ...] }
        """
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]

        runs = self._get_all_runs(project_id)
        logger.warning(
            "[topology_run_context] list_runs looking for conversation_id=%r "
            "(type=%s) among=%r",
            conversation_id,
            type(conversation_id).__name__,
            [(r.get("conversation_id"), type(r.get("conversation_id")).__name__) for r in runs],
        )
        conversation_runs = [
            run for run in runs if run.get("conversation_id") == conversation_id
        ]
        logger.warning("[topology_run_context] list_runs matched=%r", conversation_runs)
        return {"runs": conversation_runs}

    @raise_exception(
        "Failed to record topology run context.",
        exception_logger=logger,
    )
    def record_run(self, data: dict) -> dict:
        """Upserts one `{conversation_id, run_id, address}` pair. If a run
        context already exists for that `(conversation_id, run_id)`, its
        address is updated in place instead of being duplicated.
        """
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]
        run_id: str = data["run_id"]
        address: str = data["address"]

        runs = self._get_all_runs(project_id)
        existing = next(
            (
                run
                for run in runs
                if run.get("conversation_id") == conversation_id
                and run.get("run_id") == run_id
            ),
            None,
        )
        if existing is not None:
            existing["address"] = address
            entry = existing
        else:
            entry = TopologyRunContextBaseModel(
                conversation_id=conversation_id,
                run_id=run_id,
                address=address,
                created_at=_now_iso(),
            ).model_dump()
            runs.append(entry)

        self._save_all_runs(project_id, runs)
        return entry

    @raise_exception(
        "Failed to delete topology run context.",
        exception_logger=logger,
    )
    def delete_run(self, data: dict) -> dict:
        """Permanently removes one `(conversation_id, run_id)` run context."""
        project_id: str = data["project_id"]
        conversation_id: str = data["conversation_id"]
        run_id: str = data["run_id"]

        runs = self._get_all_runs(project_id)
        remaining = [
            run
            for run in runs
            if not (
                run.get("conversation_id") == conversation_id and run.get("run_id") == run_id
            )
        ]
        if len(remaining) != len(runs):
            self._save_all_runs(project_id, remaining)

        return {"conversation_id": conversation_id, "run_id": run_id}
