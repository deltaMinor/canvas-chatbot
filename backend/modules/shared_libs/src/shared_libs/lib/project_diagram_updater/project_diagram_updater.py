import logging
from datetime import datetime, tzinfo
from functools import cached_property

from shared_libs.config import DEFAULT_TZINFO
from shared_libs.decorators import raise_exception
from shared_libs.domain import DatabaseLogService, ProjectADService
from shared_libs.models.base_models import AuditLogModel
from shared_libs.models.base_models.register import ProjectRiskScenario
from shared_libs.models.database_models import ProjectADModel
from shared_libs.types.auditLog import AuditLogAction, AuditLogTargetKey
from shared_libs.types.enum import (
    AttackFlowEngineVersion,
    Collection,
    KnowledgebaseSource,
)

TZINFO = DEFAULT_TZINFO

logger = logging.getLogger(__name__)


class ProjectDiagramUpdater:
    def __init__(
        self,
        project_id: str,
        project_ad_service: "ProjectADService",
        db_log_ad_service: "DatabaseLogService",
        user_info: dict,
        tzinfo_override: tzinfo | None = None,
    ):
        self.project_id = project_id
        self.project_ad_service = project_ad_service
        self.db_log_ad_service = db_log_ad_service
        self.user_info = user_info
        self.tzinfo = tzinfo_override or TZINFO

    @cached_property
    @raise_exception(
        "Failed to retrieve project cq submitted model cache.",
        exception_logger=logger,
    )
    def project_ad_model(self) -> ProjectADModel:
        return self.get_project_ad_model()

    @raise_exception(
        "Failed to retrieve project ad model for register generation.",
        exception_logger=logger,
    )
    def get_project_ad_model(self) -> "ProjectADModel":
        project_ad = self.project_ad_service.get_one(
            {"project_id": self.project_id},
            raise_if_not_found=True,
            user_info=self.user_info,
        )
        return ProjectADModel(**project_ad)

    @raise_exception(
        "Failed to execute project diagram updater.",
        exception_logger=logger,
    )
    def update_canvas(
        self, risk_scenarios: list["ProjectRiskScenario"], add_to_existing: bool = False
    ):
        """
        Update canvases by converting relevant risk scenarios to the canvas.
        If add_to_existing flag is True, new canvases are appended to existing
        project_ad_model.canvas.
        Else, new canvases are generated and added to base canvases (list of
        architecture, dataflow type canvases).
        """
        from .canvas_updater import CanvasUpdater

        canvas_updater = CanvasUpdater(
            project_ad_model=self.project_ad_model,
        )
        canvas = canvas_updater.update_canvas(
            scenario_models=risk_scenarios, add_to_existing=add_to_existing
        )

        payload = {"canvas": [_.model_dump() for _ in canvas]}

        return self.update_ad(payload=payload)

    @raise_exception(
        "Failed to update canvas risk_scenario ref.",
        exception_logger=logger,
    )
    def update_canvas_threat_scenario_ref(self, riskScenarioId: str, field_data: dict):
        """
        Update ref.threat_scenario_ref in canvas
        """
        canvas_list = self.project_ad_model.canvas

        canvas_to_update = next(
            (
                c
                for c in canvas_list
                if c.ref.get("threat_scenario_ref", {}).get("riskScenarioId")
                == riskScenarioId
            ),
            None,
        )

        if not canvas_to_update:
            return

        threat_ref = canvas_to_update.ref.get("threat_scenario_ref", {})
        threat_ref_model = ProjectRiskScenario(**threat_ref)
        if (
            threat_ref_model.knowledgebaseSource
            != KnowledgebaseSource.threatScenario.value
            or threat_ref_model.category != AttackFlowEngineVersion.v2.value
        ):
            return

        # update nested fields
        threat_ref.update(field_data)
        canvas_to_update.ref["threat_scenario_ref"] = threat_ref

        # sync derived fields
        if "keyRisk" in field_data:
            canvas_to_update.canvas_name = field_data["keyRisk"]

        # rebuild canvas list (replace one element)
        updated_canvas = [
            c if c.canvas_id != canvas_to_update.canvas_id else canvas_to_update
            for c in canvas_list
        ]

        payload = {"canvas": [_.model_dump() for _ in updated_canvas]}

        return self.update_ad(payload=payload)

    @raise_exception("Faile to update ad with payload.")
    def update_ad(self, payload: dict):
        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": self.project_id,
                },
                "value": payload,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=self.user_info["user_id"],
            username=self.user_info["username"],
            timestamp=datetime.now(self.tzinfo),
        )

        res1 = self.project_ad_service.update_one(
            {"project_id": self.project_id},
            payload=payload,
            user_info=self.user_info,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=self.user_info,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]
