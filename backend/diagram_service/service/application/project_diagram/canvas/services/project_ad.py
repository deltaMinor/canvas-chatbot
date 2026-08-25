import base64
import copy
import json
import logging
import os
import threading
import uuid
from datetime import datetime, timedelta
from typing import Any

from celery import Celery
from django.conf import settings
from engine_libs.lib.tosca_ontology_loader import ToscaOntologyLoader
from engine_libs.lib.tosca_validator import ToscaEdgeValidator, ToscaHierarchyValidator
from service.lib.diagram_cacti_optimizer.diagram_cacti_optimizer import (
    DiagramCactiOptimizer,
)
from service.lib.diagram_generator_from_cacti.diagram_generator_from_cacti import (
    DiagramGeneratorFromCacti,
)
from service.lib.diagram_generator_from_files.diagram_generator_from_files import (
    DiagramGeneratorFromFiles,
)
from service.lib.diagram_generator_from_image.media_util import (
    convert_pdf_data_url_to_png_data_url,
)
from service.lib.diagram_generator_from_xml.diagram_generator_from_xml import (
    DiagramGeneratorFromXML,
)
from service.lib.diagram_llm_job_util import DiagramLLMJobUtil
from service.lib.diagram_node_optimizer.diagram_node_optimizer import (
    DiagramNodeOptimizer,
)

from shared_libs.constants.architecture_diagram import (
    FALLBACK_IMAGE_CONTENT_TYPE,
    MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT,
    PDF_DATA_URL_PREFIX,
    PROJECT_AD_FILE_TYPE_CACTI,
    PROJECT_AD_FILE_TYPE_DIAGRAM,
    PROJECT_AD_FILE_TYPE_IMAGE,
    PROJECT_AD_FILE_TYPE_PDF,
    PROJECT_AD_FILE_TYPE_TERRAFORM,
    PROJECT_AD_FILE_TYPE_XML,
    PROJECT_AD_LLM_IMAGE_FILE_TYPES,
)
from shared_libs.decorators import raise_exception
from shared_libs.domain import (
    DatabaseLogService,
    KbToscaService,
    MasterADTemplateService,
    ProjectADFileService,
    ProjectADService,
    ProjectCQService,
    ProjectService,
)
from shared_libs.exceptions.api_exceptions import BadRequest, InternalServerError
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_file_repository.service import (
    RemoteFileRepository,
)
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.lib.diagram_util.card_node_builder import CardNodeBuilder
from shared_libs.lib.diagram_util.card_node_processor import CardNodeProcessor
from shared_libs.lib.diagram_util.diagram_canvas_factory import DiagramCanvasFactory
from shared_libs.models.base_models import (
    AuditLogModel,
    CanvasBaseModel,
    CanvasCardNodeBaseModel,
    CanvasDataBaseModel,
    CanvasEdgeBaseModel,
    CanvasNodeBaseModel,
    MetadataModel,
    ProducerDataModel,
    ProjectADFileBaseModel,
    ProjectADRefBaseModel,
)
from shared_libs.models.database_models import (
    KbToscaModel,
    MasterADTemplateModel,
    ProjectADModel,
)
from shared_libs.producers.producer_data import (
    producer_data_database_log_ad,
    producer_data_database_log_app,
    producer_data_kb_tosca,
    producer_data_master_ad_template,
    producer_data_project,
    producer_data_project_ad,
    producer_data_project_ad_file,
    producer_data_project_cq,
)
from shared_libs.types.auditLog import AuditLogAction, AuditLogTargetKey
from shared_libs.types.enum import CanvasType, Collection, Project
from shared_libs.constants import SYSTEM_USER_INFO

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)
LLM_GENERATION_STATE_RUNNING = "running"
LLM_GENERATION_STATE_COMPLETED = "completed"
LLM_GENERATION_STATE_FAILED = "failed"


class ProjectADApplicationService(ProjectADService):
    def __init__(
        self,
        celery_app: Celery,
        *args,
        **kwargs,
    ):
        super().__init__(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_ad,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.db_log_ad_service = DatabaseLogService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_database_log_ad,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.project_ad_file_service = ProjectADFileService(
            repository=RemoteFileRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_ad_file,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.db_log_app_service = DatabaseLogService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_database_log_app,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.kb_tosca_service = KbToscaService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_kb_tosca,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.project_service = ProjectService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.project_cq_service = ProjectCQService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_cq,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.master_ad_template_service = MasterADTemplateService(
            repository=RemoteRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_master_ad_template,
                    ),
                    celery_app=celery_app,
                ),
            )
        )
        self.file_terraform_service = self.project_ad_file_service

    def _build_project_ad_file_audit_model(
        self,
        action: str,
        project_id: str,
        value: Any,
        file_id_list: list[str] | None = None,
    ) -> AuditLogModel:
        identifiers = {
            Project.project_id.value: project_id,
        }
        if file_id_list is not None:
            identifiers["file_id__list"] = file_id_list

        return AuditLogModel(
            action=action,
            fieldChanges={
                "identifiers": identifiers,
                "value": value,
            },
            targetKey=AuditLogTargetKey.project_ad_file.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

    def _insert_project_ad_file_log(
        self,
        audit_log_model: AuditLogModel,
    ):
        return self.project_ad_file_service.write_audit_log(
            audit_log_service=self.db_log_ad_service,
            audit_log_model=audit_log_model,
            collection_name=Collection.project_ad_file_log.value,
        )

    @staticmethod
    def _get_image_file_source(image_file_model: ProjectADFileBaseModel) -> str:
        return image_file_model.fileUrl or image_file_model.imageUrl or ""

    def normalize_project_ad_image_file(
        self,
        image_file: dict | ProjectADFileBaseModel,
    ) -> ProjectADFileBaseModel:
        image_file_model = (
            image_file
            if isinstance(image_file, ProjectADFileBaseModel)
            else ProjectADFileBaseModel(**image_file)
        )
        file_url = self._get_image_file_source(image_file_model)

        if not file_url:
            image_file_model.fileUrl = ""
            image_file_model.imageUrl = ""
            return image_file_model

        image_file_model.fileUrl = file_url

        if file_url.startswith(PDF_DATA_URL_PREFIX):
            image_file_model.imageUrl = convert_pdf_data_url_to_png_data_url(file_url)
            return image_file_model

        if file_url.startswith("data:image/"):
            image_file_model.imageUrl = file_url
            return image_file_model

        raise BadRequest("Upload a PNG, JPG, WEBP, or PDF file.")

    def normalize_project_ad_ref(
        self,
        ref: dict | ProjectADRefBaseModel,
        project_id: str | None = None,
    ) -> dict:
        legacy_selected_image_file = (
            ref.get("selected_image_file", {}) if isinstance(ref, dict) else {}
        )
        ref_model = (
            ref
            if isinstance(ref, ProjectADRefBaseModel)
            else ProjectADRefBaseModel(**ref)
        )

        normalized_image_files = [
            self.normalize_project_ad_image_file(image_file)
            for image_file in (ref_model.image_files or [])
            if self._get_image_file_source(image_file)
        ]
        if project_id:
            for image_file in normalized_image_files:
                file_source = self._get_image_file_source(image_file)
                if not file_source:
                    continue
                file_type = (
                    "pdf" if file_source.startswith(PDF_DATA_URL_PREFIX) else "image"
                )
                content_type = file_source.split(";", 1)[0].removeprefix("data:")
                decoded_file = file_source.split(",", 1)[-1]
                query_dict = {
                    "project_id": project_id,
                    "filename": image_file.filename or image_file.file_id,
                    "file_id": image_file.file_id or f"image_{uuid.uuid4()}",
                    "file_type": file_type,
                    "content_type": content_type,
                }
                image_file.file_id = query_dict["file_id"]
                image_file.filename = query_dict["filename"]
                self.project_ad_file_service.insert_one_file(
                    query_dict=query_dict,
                    decoded_file=decoded_file,
                    user_info=SYSTEM_USER_INFO,
                )
                audit_file_model = ProjectADFileBaseModel(
                    data=decoded_file,
                    file_id=query_dict["file_id"],
                    filename=query_dict["filename"],
                    file_type=file_type,
                    content_type=content_type,
                    project_id=project_id,
                    timestamp=datetime.now(TZINFO),
                )
                audit_log_model = self._build_project_ad_file_audit_model(
                    action=AuditLogAction.create.value,
                    project_id=project_id,
                    value=audit_file_model.model_dump(exclude={"data"}),
                )
                self._insert_project_ad_file_log(
                    audit_log_model=audit_log_model,
                )

        if len(normalized_image_files) > MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT:
            raise BadRequest(
                f"Upload limit exceeded. Maximum {MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT} files allowed."
            )

        selected_image_id = (
            ref_model.selected_image_file_id
            or legacy_selected_image_file.get("file_id")
            or ""
        )

        if (
            not normalized_image_files
            and legacy_selected_image_file
            and self._get_image_file_source(
                ProjectADFileBaseModel(**legacy_selected_image_file)
            )
        ):
            normalized_image_files = [
                self.normalize_project_ad_image_file(
                    ProjectADFileBaseModel(**legacy_selected_image_file)
                )
            ]
            selected_image_id = (
                selected_image_id or normalized_image_files[0].file_id or ""
            )

        if normalized_image_files:
            matching_selected_image_file = next(
                (
                    image_file
                    for image_file in normalized_image_files
                    if image_file.file_id == selected_image_id
                ),
                None,
            )
            ref_model.selected_image_file_id = (
                matching_selected_image_file or normalized_image_files[0]
            ).file_id or ""
        else:
            ref_model.selected_image_file_id = ""
        return ref_model.model_dump(exclude={"image_files"})

    def get_project_ad_image_file_data_url(self, file: dict) -> str:
        content_type = self.infer_project_ad_image_content_type(file)
        return f"data:{content_type};base64,{file.get('data') or ''}"

    def infer_project_ad_image_content_type(self, file: dict) -> str:
        content_type = file.get("content_type") or ""
        if content_type and content_type != "application/octet-stream":
            return content_type

        file_type = (file.get("file_type") or "").lower()
        if file_type == PROJECT_AD_FILE_TYPE_PDF:
            return "application/pdf"

        filename = (file.get("filename") or "").lower()
        if filename.endswith(".bmp"):
            return "image/bmp"
        if filename.endswith(".gif"):
            return "image/gif"
        if filename.endswith(".jpeg") or filename.endswith(".jpg"):
            return "image/jpeg"
        if filename.endswith(".png"):
            return "image/png"
        if filename.endswith(".webp"):
            return "image/webp"

        if file_type == PROJECT_AD_FILE_TYPE_IMAGE:
            return FALLBACK_IMAGE_CONTENT_TYPE

        return content_type or "application/octet-stream"

    def get_project_ad_image_file_model(
        self,
        file: dict,
        include_data: bool = False,
    ) -> ProjectADFileBaseModel:
        data_url = self.get_project_ad_image_file_data_url(file) if include_data else ""
        is_pdf = (file.get("file_type") or "") == PROJECT_AD_FILE_TYPE_PDF
        image_file_model = ProjectADFileBaseModel(
            file_id=file.get("file_id") or "",
            filename=file.get("filename") or "",
            imageUrl="" if is_pdf else data_url,
            fileUrl=data_url,
        )

        if include_data:
            return self.normalize_project_ad_image_file(image_file_model)

        return image_file_model

    def get_project_ad_image_file_payload(
        self,
        file: dict,
        include_data: bool = False,
    ) -> dict:
        image_file = self.get_project_ad_image_file_model(
            file,
            include_data=include_data,
        ).model_dump()
        return {
            **image_file,
            "file_id": file.get("file_id") or "",
            "filename": file.get("filename") or "",
            "file_type": file.get("file_type") or "",
            "content_type": file.get("content_type") or "",
            "timestamp": file.get("timestamp"),
            "chunkSize": file.get("chunkSize"),
            "length": file.get("length"),
            "uploadDate": file.get("uploadDate"),
        }

    def get_project_ad_image_files_query(
        self,
        project_id: str,
        extra: dict | None = None,
        file_types: list[str] | None = None,
    ) -> dict:
        return {
            "project_id": project_id,
            "file_type": {"$in": file_types or PROJECT_AD_LLM_IMAGE_FILE_TYPES},
            **(extra or {}),
        }

    def update_project_ad_selected_image_file(
        self,
        project_id: str,
        selected_image_file: ProjectADFileBaseModel,
    ):
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(**db_project_ad)
        project_ad_model.ref.selected_image_file_id = selected_image_file.file_id or ""
        return self.update_one(
            {"project_id": project_id},
            payload={"ref": project_ad_model.ref.model_dump(exclude={"image_files"})},
            user_info=SYSTEM_USER_INFO,
        )

    def get_project_ad_image_files(
        self,
        data: dict,
        file_types: list[str] | None = None,
    ) -> dict:
        project_id = data["project_id"]
        files = self.project_ad_file_service.get_many_files(
            self.get_project_ad_image_files_query(project_id, file_types=file_types),
        )
        project_ad = self.get_project_ad(
            data={"project_id": project_id},
        )
        selected_file_id = project_ad.get("ref", {}).get("selected_image_file_id") or ""
        return {
            "project_id": project_id,
            "files": [
                self.get_project_ad_image_file_payload(file, include_data=False)
                for file in files
            ],
            "selected_file_id": selected_file_id,
        }

    def insert_project_ad_image_files(
        self,
        data: dict,
        files,
        file_types: list[str] | None = None,
    ) -> list[dict]:
        project_id = data["project_id"]
        image_files = files.getlist("file")
        db_image_files = self.project_ad_file_service.get_many_files(
            self.get_project_ad_image_files_query(project_id),
        )
        if len(db_image_files) + len(image_files) > MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT:
            raise BadRequest(
                f"Upload limit exceeded. Maximum {MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT} files allowed."
            )

        res_arr = []
        selected_image_file = ProjectADFileBaseModel()
        for uploaded_file in image_files:
            content_type = uploaded_file.content_type or ""
            encoded_file = base64.b64encode(uploaded_file.file.read()).decode("utf-8")
            data_url = f"data:{content_type};base64,{encoded_file}"
            file_type = (
                PROJECT_AD_FILE_TYPE_PDF
                if data_url.startswith(PDF_DATA_URL_PREFIX)
                else PROJECT_AD_FILE_TYPE_IMAGE
            )
            if file_type not in (file_types or PROJECT_AD_LLM_IMAGE_FILE_TYPES):
                raise BadRequest("Uploaded file type does not match this endpoint.")
            file_id = f"image_{uuid.uuid4()}"
            normalized_image_file = self.normalize_project_ad_image_file(
                ProjectADFileBaseModel(
                    file_id=file_id,
                    filename=uploaded_file.name,
                    imageUrl="" if file_type == PROJECT_AD_FILE_TYPE_PDF else data_url,
                    fileUrl=data_url,
                )
            )
            selected_image_file = normalized_image_file
            project_ad_file_model = ProjectADFileBaseModel(
                data=encoded_file,
                file_id=file_id,
                filename=uploaded_file.name,
                file_type=file_type,
                content_type=content_type,
                project_id=project_id,
                timestamp=datetime.now(TZINFO),
            )

            res1 = self.project_ad_file_service.insert_one_file(
                query_dict={
                    "project_id": project_id,
                    "filename": project_ad_file_model.filename,
                    "file_id": project_ad_file_model.file_id,
                    "file_type": project_ad_file_model.file_type,
                    "content_type": project_ad_file_model.content_type or "",
                },
                decoded_file=encoded_file,
                user_info=SYSTEM_USER_INFO,
            )
            audit_log_model = self._build_project_ad_file_audit_model(
                action=AuditLogAction.create.value,
                project_id=project_id,
                value=project_ad_file_model.model_dump(exclude={"data"}),
            )
            res2 = self._insert_project_ad_file_log(
                audit_log_model=audit_log_model,
            )
            res_arr.extend([res1, res2])

        if selected_image_file.file_id:
            res_arr.append(
                self.update_project_ad_selected_image_file(
                    project_id=project_id,
                    selected_image_file=selected_image_file,
                )
            )

        return res_arr

    def select_project_ad_image_file(
        self,
        data: dict,
        file_types: list[str] | None = None,
    ) -> dict:
        data = self.filter_request_data(data=data)
        project_id = data["project_id"]
        file_id = data["file_id"]
        files = self.project_ad_file_service.get_many_files(
            self.get_project_ad_image_files_query(
                project_id,
                {"file_id": file_id},
                file_types=file_types,
            ),
        )
        if not files:
            raise BadRequest("Selected image file does not exist.")

        selected_image_file = self.get_project_ad_image_file_model(
            files[0],
            include_data=True,
        )
        return self.update_project_ad_selected_image_file(
            project_id=project_id,
            selected_image_file=selected_image_file,
        )

    def delete_project_ad_image_files(
        self,
        data: dict,
        file_types: list[str] | None = None,
    ) -> list[dict]:
        project_id = data["project_id"]
        file_id_list = data["file_id_list"]
        audit_log_model = self._build_project_ad_file_audit_model(
            action=AuditLogAction.delete.value,
            project_id=project_id,
            file_id_list=file_id_list,
            value={"deleted_file_ids": file_id_list},
        )
        res1 = self.project_ad_file_service.delete_many_files(
            query_dict=self.get_project_ad_image_files_query(
                project_id,
                {"file_id": {"$in": file_id_list}},
                file_types=file_types,
            ),
        )
        res2 = self._insert_project_ad_file_log(
            audit_log_model=audit_log_model,
        )

        remaining_files = self.project_ad_file_service.get_many_files(
            self.get_project_ad_image_files_query(project_id),
        )
        selected_image_file = (
            self.get_project_ad_image_file_model(remaining_files[0], include_data=True)
            if remaining_files
            else ProjectADFileBaseModel()
        )
        res3 = self.update_project_ad_selected_image_file(
            project_id=project_id,
            selected_image_file=selected_image_file,
        )
        return [res1, res2, res3]

    @raise_exception(
        "Failed to delete dangling edges.",
        exception_logger=logger,
    )
    def _delete_dangling_edges(
        self,
        canvases: list["CanvasBaseModel"],
    ) -> bool:
        changed = False
        all_node_ids = {node.id for canvas in canvases for node in canvas.nodes}
        for canvas in canvases:
            filtered_edges = [
                edge
                for edge in canvas.edges
                if edge.source in all_node_ids and edge.target in all_node_ids
            ]
            if len(canvas.edges) != len(filtered_edges):
                changed = True
                canvas.edges = filtered_edges
        return changed

    @raise_exception(
        "Failed to clear node's data stored.",
        exception_logger=logger,
    )
    def _clear_data_stored(
        self,
        nodes: list["CanvasNodeBaseModel"],
    ) -> None:
        for node in nodes:
            if isinstance(node.data, dict):
                node.data["data_stored"] = []

    @raise_exception(
        "Failed to retrieve tosca schema and mapping.",
        exception_logger=logger,
    )
    def _retrieve_tosca_information(
        self,
        user_info: dict,
    ) -> tuple[str, dict]:
        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=user_info,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)
        tosca_mapping = kb_tosca_model.tosca_mapping

        enumerated_tosca_mapping = {}
        for _k, v in tosca_mapping.mapping_to_individual.model_dump().items():
            enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}
        for _k, v in tosca_mapping.mapping_to_class.model_dump().items():
            enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}
        return (kb_tosca_model.schema_, enumerated_tosca_mapping)

    @raise_exception(
        "Failed to update nodes tosca type.",
        exception_logger=logger,
    )
    def _update_nodes_tosca_type_by_icon_key(
        self, nodes: list["CanvasNodeBaseModel"], tosca_schema: str, tosca_mapping: dict
    ):
        changed = False
        for node in nodes:
            if node.data.get("tosca_schema") == tosca_schema:
                continue
            icon_key = node.data.get("icon", "")
            node.data["tosca_type"] = tosca_mapping.get(icon_key, "")
            node.data["tosca_schema"] = tosca_schema
            changed = True
        return changed

    @raise_exception(
        "Failed to retrieve updated canvas.",
        exception_logger=logger,
    )
    def get_updated_canvas_model(
        self,
        card_nodes: list[dict[str, Any]],
        diagram: dict,
        user_story_cards: list[dict],
    ) -> list[CanvasBaseModel]:
        """
        Retrieves the updated canvas model.

        This method uses the DiagramCanvasFactory to get the updated architecture canvas model and
        generate data flow canvas models from user story cards. These are then combined into a
        single list which is returned.

        Args:
            card_nodes (List[dict[str, Any]]): A list of card node dictionary
            diagram: The diagram for which the updated canvas model is to be retrieved.
            user_story_cards (List[dict]): The user story cards from which to generate data flow
            canvas models.

        Returns:
            List[CanvasBaseModel]: A list of canvas models.

        Raises:
            Exception: If the canvas models cannot be retrieved.
        """
        canvas_models = []

        # Get architecture canvas model
        diagram_canvas_factory = DiagramCanvasFactory()
        architecture_canvas_model = (
            diagram_canvas_factory.get_architecture_canvas_model(
                diagram=diagram,
            )
        )
        canvas_models.append(architecture_canvas_model)

        # Get data flow canvas models
        data_flow_canvas_models = diagram_canvas_factory.get_data_flow_canvas_models(
            card_nodes=card_nodes,
            user_story_cards=user_story_cards,
        )
        canvas_models.extend(data_flow_canvas_models)

        return canvas_models

    @staticmethod
    def normalize_project_ad_nested_models(project_ad_model: ProjectADModel) -> None:
        """Coerce nested project AD fields into typed models before serialization."""
        project_ad_model.canvas = [
            canvas if isinstance(canvas, CanvasBaseModel) else CanvasBaseModel(**canvas)
            for canvas in (project_ad_model.canvas or [])
        ]
        project_ad_model.card_nodes = [
            card_node
            if isinstance(card_node, CanvasCardNodeBaseModel)
            else CanvasCardNodeBaseModel(**card_node)
            for card_node in (project_ad_model.card_nodes or [])
        ]

    @raise_exception(
        "Failed to initialize canvas from CACTi.",
        exception_logger=logger,
    )
    def initialize_architecture_canvas_from_cacti(
        self,
        data: dict,
    ) -> dict:
        """Initializes the architecture canvas from CACTi.

        This method initializes the architecture canvas from the provided CACTi
        files. It ensures that the request is authenticated and authorized to
        perform the initialization. It raises an exception if the initialization
        fails.

        Args:
            data (dict): A dictionary containing the data for initializing the
            architecture canvas, including 'project_id' and 'selected_cacti_file_id'.
            permissions (List[str]): A list of permissions required for the
            operation.

        Returns:
            dict: A dictionary containing the updated project architecture diagram model.

        Raises:
            Exception: If the initialization of the architecture canvas fails.
        """
        project_id = data["project_id"]
        selected_cacti_file_id = data["selected_cacti_file_id"]

        # Verify the project ID
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # Get the user story cards for the project
        # Update the card nodes based on the user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )

        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Retrieve project cacti model from database using the provided project id
        # Construct node and edge id list using retrieved CACTi json
        db_project_cacti_files = self.project_ad_file_service.get_many_files(
            {
                "project_id": project_id,
                "file_type": PROJECT_AD_FILE_TYPE_CACTI,
            },
        )

        cacti_file = next(
            _ for _ in db_project_cacti_files if _["file_id"] == selected_cacti_file_id
        )

        cacti = json.loads(
            self.project_ad_file_service.get_project_ad_file_data(cacti_file)
        )
        diagram_generator = DiagramGeneratorFromCacti(cacti)

        cacti = diagram_generator.get_generated_diagram()
        cacti_optimizer = DiagramCactiOptimizer(cacti)
        diagram = cacti_optimizer.assign_positions()

        # Get updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=diagram,
            user_story_cards=user_story_cards,
        )
        project_ad_model.canvas = canvas_models

        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)

        # Populate data flow nodes
        card_node_processor = CardNodeProcessor(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
            kb_tosca_model=kb_tosca_model,
        )
        card_node_processor.populate_data_flow_node()

        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )
            self._clear_data_stored(
                nodes=canvas.nodes,
            )

        field_data = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in project_ad_model.canvas],
            "ref.selected_cacti_file_id": selected_cacti_file_id,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )

        project_ad_model.__dict__.update(field_data)
        self.normalize_project_ad_nested_models(project_ad_model)
        return project_ad_model.model_dump()

    @raise_exception(
        "Failed to initialize canvas from diagram file.",
        exception_logger=logger,
    )
    def initialize_architecture_canvas_from_diagram_file(
        self,
        data: dict,
    ) -> dict:
        """Initializes the architecture canvas from diagram file.

        This method initializes the architecture canvas from the provided diagram
        file. It ensures that the request is authenticated and authorized to
        perform the initialization. It raises an exception if the initialization
        fails.

        Args:
            data (dict): A dictionary containing the data for initializing the
            architecture canvas, including 'project_id' and 'selected_diagram_file_id'.
            permissions (List[str]): A list of permissions required for the
            operation.

        Returns:
            dict: A dictionary containing the updated project architecture diagram model.

        Raises:
            Exception: If the initialization of the architecture canvas fails.
        """
        project_id = data["project_id"]
        selected_diagram_file_id = data["selected_diagram_file_id"]

        # Verify the project ID
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # Get the user story cards for the project
        # Update the card nodes based on the user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )

        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Retrieve project diagram json model from database using the provided project id
        # Construct node and edge id list using retrieved diagram json
        db_project_diagram_files = self.project_ad_file_service.get_many_files(
            {
                "project_id": project_id,
                "file_type": PROJECT_AD_FILE_TYPE_DIAGRAM,
            },
        )

        project_diagram_file = next(
            file
            for file in db_project_diagram_files
            if file["file_id"] == selected_diagram_file_id
        )
        file_data = json.loads(
            self.project_ad_file_service.get_project_ad_file_data(project_diagram_file)
        )

        diagram = CanvasDataBaseModel(**file_data).model_dump()

        # Get updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=diagram,
            user_story_cards=user_story_cards,
        )
        project_ad_model.canvas = canvas_models

        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)

        # Populate data flow nodes
        card_node_processor = CardNodeProcessor(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
            kb_tosca_model=kb_tosca_model,
        )
        card_node_processor.populate_data_flow_node()

        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )
            self._clear_data_stored(
                nodes=canvas.nodes,
            )

        # Prepare the payload for updating the database
        # Update the database
        field_data = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in project_ad_model.canvas],
            "ref.selected_diagram_file_id": selected_diagram_file_id,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )

        project_ad_model.__dict__.update(field_data)
        self.normalize_project_ad_nested_models(project_ad_model)
        return project_ad_model.model_dump()

    @raise_exception("Failed to initialize canvas from template.")
    @raise_exception(
        "Failed to initialize canvas from template.",
        exception_logger=logger,
    )
    def initialize_architecture_canvas_from_template(
        self,
        data: dict,
    ) -> dict:
        """Initializes the architecture canvas from a template.

        This method initializes the architecture canvas from the provided template.
        It ensures that the request is authenticated and authorized to perform
        the initialization. It raises an exception if the initialization fails.

        Args:
            data (dict): A dictionary containing the data for initializing the
            architecture canvas, including 'project_id' and 'selected_template_id'.
            permissions (List[str]): A list of permissions required for the
            operation.

        Returns:
            dict: A dictionary containing the updated project architecture diagram model.

        Raises:
            Exception: If the initialization of the architecture canvas fails.
        """
        project_id = data["project_id"]
        selected_template_id = data["selected_template_id"]

        # Verify the project ID
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # Get the user story cards for the project
        # Update the card nodes based on the user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )
        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Retrieve the architecture diagram (AD) template model from the database using the provided
        # template ID
        # If the AD template model exists, extract the template data and template view
        # Construct the diagram dictionary using the nodes, edges, and viewport from the template
        # data
        db_master_ad_template = self.master_ad_template_service.get_one(
            {"templateId": selected_template_id},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        master_ad_template_model = MasterADTemplateModel(**db_master_ad_template)

        template_data = master_ad_template_model.templateData

        diagram = {
            "nodes": [_.model_dump() for _ in template_data.nodes],
            "edges": [_.model_dump() for _ in template_data.edges],
            "viewport": template_data.viewport.model_dump(),
        }

        # Get the updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=diagram,
            user_story_cards=user_story_cards,
        )
        project_ad_model.canvas = canvas_models

        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)

        # Populate data flow nodes
        card_node_processor = CardNodeProcessor(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
            kb_tosca_model=kb_tosca_model,
        )
        card_node_processor.populate_data_flow_node()

        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )
            self._clear_data_stored(
                nodes=canvas.nodes,
            )

        # Prepare the payload for updating the database
        # Update the database
        field_data = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in project_ad_model.canvas],
            "ref.selected_template_id": selected_template_id,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )

        project_ad_model.__dict__.update(field_data)
        self.normalize_project_ad_nested_models(project_ad_model)
        return project_ad_model.model_dump()

    @raise_exception(
        "Failed to initialize canvas from XML.",
        exception_logger=logger,
    )
    def initialize_architecture_canvas_from_xml(
        self,
        data: dict,
    ) -> dict:
        """Initializes the architecture canvas from XML.

        This method initializes the architecture canvas from the provided XML
        files. It ensures that the request is authenticated and authorized to
        perform the initialization. It raises an exception if the initialization
        fails.

        Args:
            data (dict): A dictionary containing the data for initializing the
            architecture canvas, including 'project_id' and 'selected_xml_file_id'.
            permissions (List[str]): A list of permissions required for the
            operation.

        Returns:
            dict: A dictionary containing the updated project architecture diagram model.

        Raises:
            Exception: If the initialization of the architecture canvas fails.
        """
        project_id = data[Project.project_id.value]
        selected_xml_file_id = data["selected_xml_file_id"]

        # Verify the project ID
        db_project_ad = self.get_one(
            {Project.project_id.value: project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # Get the user story cards for the project
        # Update the card nodes based on the user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )
        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Retrieve project xml model from database using the provided project id
        # Construct node and edge id list using retrieved XML
        db_project_xml_files = self.project_ad_file_service.get_many_files(
            {
                Project.project_id.value: project_id,
                "file_type": PROJECT_AD_FILE_TYPE_XML,
            },
        )

        xml_file = next(
            file
            for file in db_project_xml_files
            if file["file_id"] == selected_xml_file_id
        )

        diagram_generator = DiagramGeneratorFromXML(
            self.project_ad_file_service.get_project_ad_file_data(xml_file),
        )
        diagram = diagram_generator.get_generated_diagram()

        # Get updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=diagram,
            user_story_cards=user_story_cards,
        )
        project_ad_model.canvas = canvas_models

        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)

        # Populate data flow nodes
        card_node_processor = CardNodeProcessor(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
            kb_tosca_model=kb_tosca_model,
        )
        card_node_processor.populate_data_flow_node()

        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )
            self._clear_data_stored(
                nodes=canvas.nodes,
            )

        # Prepare the payload for updating the database
        # Update the database
        field_data = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in project_ad_model.canvas],
            "ref.selected_xml_file_id": selected_xml_file_id,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    Project.project_id.value: project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        self.update_one(
            {Project.project_id.value: project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )

        project_ad_model.__dict__.update(field_data)
        self.normalize_project_ad_nested_models(project_ad_model)
        return project_ad_model.model_dump()

    @raise_exception(
        "Failed to initialize canvas from iac.",
        exception_logger=logger,
    )
    def initialize_architecture_canvas_from_iac(
        self,
        data: dict,
    ) -> dict:
        """Initializes the architecture canvas from IaC.

        This method initializes the architecture canvas from the provided
        Infrastructure as Code (IaC) files. It ensures that the request is
        authenticated and authorized to perform the initialization. It raises
        an exception if the initialization fails.

        Args:
            data (dict): A dictionary containing the data for initializing the
            architecture canvas, including 'project_id', 'selected_terraform_file_id_list',
            and 'selected_module_file_id_list'.
            permissions (List[str]): A list of permissions required for the
            operation.

        Returns:
            dict: A dictionary containing the updated project architecture diagram model.

        Raises:
            Exception: If the initialization of the architecture canvas fails.
        """
        project_id = data["project_id"]
        selected_terraform_file_id_list = data["selected_terraform_file_id_list"]
        selected_module_file_id_list = data["selected_module_file_id_list"]
        # TODO: selected_module_file_id_list not being used. find out why.

        # Verify the project ID
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # Get the user story cards for the project
        # Update the card nodes based on the user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )
        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Define the directories for terraform and graph
        # Create the directories if they do not exist
        terraform_dir = "/terraform"
        graph_dir = "/graph"
        for directory in [terraform_dir, graph_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

        # Get the terraform files from the database
        # If there are files, generate the diagram and provider
        db_files = self.file_terraform_service.get_many_files(
            {
                "project_id": project_id,
                "file_type": PROJECT_AD_FILE_TYPE_TERRAFORM,
                "file_id": {
                    "$in": selected_terraform_file_id_list,
                },
            },
        )
        diagram = None
        if len(db_files):
            diagram_generator = DiagramGeneratorFromFiles()
            diagram, _ = diagram_generator.get_generated_diagram(
                db_files, terraform_dir, graph_dir
            )

            # Approach 1
            # diagram_organiser = DiagramOrganiser(
            #     diagram=diagram,
            # )
            # diagram = diagram_organiser.editJson()

            # Approach 2. seems to work for the govtech tf files, hasnt been tried with nested
            # parent groups though
            node_optimizer = DiagramNodeOptimizer()
            diagram = node_optimizer.assign_positions(diagram)

        # Get the updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=diagram,
            user_story_cards=user_story_cards,
        )
        project_ad_model.canvas = canvas_models

        db_kb_tosca = self.kb_tosca_service.get_one(
            {"schema_": self.kb_tosca_service.SCHEMA},
            user_info=SYSTEM_USER_INFO,
            raise_if_not_found=True,
        )
        kb_tosca_model = KbToscaModel(**db_kb_tosca)

        # Populate data flow nodes
        card_node_processor = CardNodeProcessor(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
            kb_tosca_model=kb_tosca_model,
        )
        card_node_processor.populate_data_flow_node()

        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )
            self._clear_data_stored(
                nodes=canvas.nodes,
            )

        field_data = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in project_ad_model.canvas],
            "ref.selected_terraform_file_id_list": selected_terraform_file_id_list,
            "ref.selected_module_file_id_list": selected_module_file_id_list,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )

        project_ad_model.__dict__.update(field_data)
        self.normalize_project_ad_nested_models(project_ad_model)
        return project_ad_model.model_dump()

    @raise_exception(
        "Failed to initialize blank canvas.",
        exception_logger=logger,
    )
    def initialize_blank_canvas(
        self,
        data: dict,
    ) -> dict:
        """
        Initializes a blank canvas for a specific project.

        This method requires the permissions provided in the 'permissions' list. The project ID
        should be provided in the 'data' dictionary under the key 'project_id'. It retrieves user
        story cards, updates card nodes and canvas, and saves the canvas in the database.

        Args:
            data (dict): The dictionary containing the project ID under the key 'project_id'.
            permissions (List[str]): The list of permissions required to perform the operation.

        Raises:
            Exception: If an error occurs while initializing the blank canvas.

        Returns:
            dict: A dictionary containing the project ID, updated card nodes, and canvas.
        """
        project_id = data["project_id"]

        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )

        # get user story cards
        cards_file_path = f"./././data/card_answers_{project_id}.json"
        if not os.path.exists(cards_file_path):
            cards_file_path = "./././data/card_answers_.json"
        with open(cards_file_path) as fp:
            cards = json.load(fp)
        project_cq_submitted_value = {"field_aYTgbRTobNfeTx8qfgNaYX": cards}
        card_node_builder = CardNodeBuilder(
            values=project_cq_submitted_value,
            project_ad_model=project_ad_model,
        )
        user_story_cards = card_node_builder.user_story_cards
        card_nodes = card_node_builder.card_nodes

        # Get updated canvas
        canvas_models = self.get_updated_canvas_model(
            card_nodes=card_nodes,
            diagram=None,
            user_story_cards=user_story_cards,
        )

        # save canvas in database
        payload = {
            "card_nodes": card_nodes,
            "canvas": [_.model_dump() for _ in canvas_models],
        }

        reserved_keys = ["project_id"]
        field_data = self.filter_request_data(
            data=payload,
            reserved_keys=reserved_keys,
            model=ProjectADModel,
        )

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to update project progress.",
        exception_logger=logger,
    )
    def update_project_progress(
        self,
        project_id: str,
        progress_number: int,
    ):
        field_data = {
            "project_progress.architecture_diagram": progress_number,
        }

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.projects.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.project_service.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_app_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_log.value,
        )
        return [res1, res2]

    def _try_update_project_progress(
        self,
        project_id: str,
        progress_number: int,
    ) -> None:

        def _run() -> None:
            try:
                self.update_project_progress(
                    project_id=project_id,
                    progress_number=progress_number,
                )
            except InternalServerError:
                logger.warning(
                    "Skipping project progress update for project_id="
                    f"{project_id!r} (progress_number={progress_number}): "
                    "the call failed or timed out, which usually means "
                    "nothing is consuming the 'application_queue' task in "
                    "this environment. This does not affect the diagram "
                    "save itself.",
                    exc_info=True,
                )

        threading.Thread(target=_run, daemon=True).start()

    @raise_exception(
        "Failed to update project ad model.",
        exception_logger=logger,
    )
    def update_project_ad(
        self,
        data: dict,
        reserved_keys: list[str],
    ) -> dict:
        """
        Updates the architecture diagram (AD) for a specific project.

        This method requires the permissions provided in the 'permissions' list. The project ID,
        canvas list, and card nodes should be provided in the 'data' dictionary. It updates the AD
        for the project in the database and returns the updated data.

        Args:
            data (dict): The dictionary containing the project ID, canvas, and card nodes.
            permissions (List[str]): The list of permissions required to perform the operation.
            reserved_keys (List[str]): The list of keys that should not be updated in the database.

        Raises:
            Exception: If an error occurs while updating the project AD model.

        Returns:
            dict: The updated data for the project AD.
        """
        project_id = data["project_id"]

        # If a canvas is provided, convert it to a CanvasBaseModel and dump it to a dictionary
        canvas = data.get("canvas")
        if canvas:
            for single_canvas in canvas:
                for node in single_canvas["nodes"]:
                    extent = node.get("extent")
                    node["extent"] = extent if isinstance(extent, str) else None
            canvas_models = [CanvasBaseModel(**_) for _ in canvas]
            data["canvas"] = [_.model_dump() for _ in canvas_models]

        # If card nodes are provided, convert each card node to a CanvasCardNodeBaseModel and dump
        # it to a dictionary
        card_nodes = data.get("card_nodes")
        if card_nodes:
            data["card_nodes"] = [
                CanvasCardNodeBaseModel(**_).model_dump() for _ in card_nodes
            ]

        ref = data.get("ref")
        if ref:
            data["ref"] = self.normalize_project_ad_ref(
                ref,
                project_id=project_id,
            )

        if data.get("isCompleted") is True:
            lastCompletedBy_model = MetadataModel(
                **SYSTEM_USER_INFO,
                timestamp=datetime.now(TZINFO),
            )
            data["lastCompletedBy"] = lastCompletedBy_model.model_dump()
            self._try_update_project_progress(
                project_id=project_id,
                progress_number=2,
            )
        if data.get("isCompleted") is False:
            self._try_update_project_progress(
                project_id=project_id,
                progress_number=1,
            )
        if data.get("isCompleted") is True:
            data["ad_version_id"] = f"ad_{uuid.uuid4()}"

        field_data = self.filter_request_data(
            data=data,
            reserved_keys=reserved_keys,
            model=ProjectADModel,
        )

        # audit_log_model = AuditLogModel(
        #     action=AuditLogAction.update.value,
        #     fieldChanges={
        #         "identifiers": {
        #             "project_id": project_id,
        #         },
        #         "value": field_data,
        #     },
        #     targetKey=AuditLogTargetKey.project_ad.value,
        #     user_id=SYSTEM_USER_INFO["user_id"],
        #     username=SYSTEM_USER_INFO["username"],
        #     timestamp=datetime.now(TZINFO),
        # )

        res1 = self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        # res2 = self.db_log_ad_service.update_one(
        #     {"logId": audit_log_model.logId},
        #     payload={
        #         **audit_log_model.model_dump(),
        #     },
        #     user_info=SYSTEM_USER_INFO,
        #     upsert=True,
        #     collection_name=Collection.project_ad_log.value,
        # )
        return [res1]
        # return [res1, res2]

    @raise_exception(
        "Failed to retrieve project ad.",
        exception_logger=logger,
    )
    def get_project_ad(
        self,
        data: dict,
    ) -> dict:
        """
        Retrieves the architecture diagram for a specific project.

        This method requires the permissions provided in the 'permissions' list. The project ID
        should be provided in the 'data' dictionary under the key 'project_id'.

        Args:
            data (dict): The dictionary containing the project ID under the key 'project_id'.
            permissions (List[str]): The list of permissions required to perform the operation.

        Raises:
            Exception: If an error occurs while retrieving the architecture diagram model.

        Returns:
            dict: The architecture diagram for the specified project.
        """
        project_id = data["project_id"]

        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(**db_project_ad)

        update_flag = self._delete_dangling_edges(
            canvases=project_ad_model.canvas,
        )
        tosca_schema, tosca_mapping = self._retrieve_tosca_information(
            user_info=SYSTEM_USER_INFO,
        )
        for canvas in project_ad_model.canvas:
            if canvas.canvas_type == CanvasType.data_flow.value:
                continue
            update_flag |= self._update_nodes_tosca_type_by_icon_key(
                nodes=canvas.nodes,
                tosca_schema=tosca_schema,
                tosca_mapping=tosca_mapping,
            )

        self.normalize_project_ad_nested_models(project_ad_model)
        project_ad = project_ad_model.model_dump()
        project_ad["ref"] = self.normalize_project_ad_ref(project_ad.get("ref", {}))

        if update_flag:
            self.update_one(
                {"project_id": project_id},
                payload=project_ad,
                user_info=SYSTEM_USER_INFO,
            )

        return project_ad

    @raise_exception(
        "Failed to update tosca report.",
        exception_logger=logger,
    )
    def update_tosca_report(
        self,
        data: dict,
    ) -> dict:
        """
        Generate and return the diagram with updated warnings for the diagram specified by the
        project_id in data.

        Args:
            data (dict): dict containing the project_id of the diagram that needs the report

        Returns:
            dict: The diagram with updated warnings
        """
        project_id = data["project_id"]

        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_ad_model = ProjectADModel(
            **db_project_ad,
        )
        self.normalize_project_ad_nested_models(project_ad_model)
        project_ad = project_ad_model.model_dump()

        nodes, edges = [], []
        for canvas in project_ad["canvas"]:
            if canvas["canvas_type"] != CanvasType.architecture.value:
                continue
            nodes.extend(canvas["nodes"])
            edges.extend(canvas["edges"])
            break

        for i, canvas in enumerate(project_ad["canvas"]):
            if canvas.get("canvas_type") not in [
                CanvasType.architecture.value,
                CanvasType.data_flow.value,
            ]:
                continue

            # Deep copy to prevent unintentionally modify original canvas
            _canvas = copy.deepcopy(canvas)
            if _canvas.get("canvas_type") == CanvasType.data_flow.value:
                _canvas["nodes"].extend(nodes)
                _canvas["edges"].extend(edges)

            new_warning_list = []
            new_edge_warning_list = ToscaEdgeValidator().check_diagram_validity(_canvas)
            new_hierarchy_warning_list = (
                ToscaHierarchyValidator().check_diagram_validity(_canvas)
            )

            new_warning_list.extend(new_edge_warning_list)
            new_warning_list.extend(new_hierarchy_warning_list)
            old_warning_list = project_ad["canvas"][i]["warnings"]
            merged_warning_list = ToscaOntologyLoader.merge_warning_list(
                old_warning_list, new_warning_list
            )

            project_ad["canvas"][i]["warnings"] = merged_warning_list

        payload = {
            "card_nodes": project_ad["card_nodes"],
            "canvas": project_ad["canvas"],
        }

        reserved_keys = ["project_id"]
        field_data = self.filter_request_data(
            data=payload,
            reserved_keys=reserved_keys,
            model=ProjectADModel,
        )

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.update_one(
            {"project_id": project_id},
            payload=field_data,
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to retrieve project diagram logs.",
        exception_logger=logger,
    )
    def get_project_diagram_logs(
        self,
        data: dict,
    ):
        project_id = data["project_id"]

        db_audit_logs = self.db_log_ad_service.get_many(
            {
                "fieldChanges.identifiers.project_id": project_id,
                "targetKey": {
                    "$in": [
                        AuditLogTargetKey.project_ad.value,
                        AuditLogTargetKey.project_ad_canvas.value,
                        AuditLogTargetKey.project_ad_edge.value,
                        AuditLogTargetKey.project_ad_node.value,
                    ]
                },
            },
            user_info=SYSTEM_USER_INFO,
            collection_name=Collection.project_ad_log.value,
        )
        audit_log_models = [AuditLogModel(**_) for _ in db_audit_logs]
        audit_log_models.sort(key=lambda x: x.timestamp, reverse=True)
        return [_.model_dump() for _ in audit_log_models]

    @raise_exception(
        "Failed to retrieve project diagram node logs.",
        exception_logger=logger,
    )
    def get_project_diagram_node_logs(
        self,
        data: dict,
    ):
        project_id = data["project_id"]
        node_id = data["node_id"]

        query = {
            "fieldChanges.identifiers.project_id": project_id,
            "fieldChanges.identifiers.node_id": node_id,
            "targetKey": AuditLogTargetKey.project_ad_node.value,
        }

        db_audit_logs = self.db_log_ad_service.get_many(
            query,
            user_info=SYSTEM_USER_INFO,
            collection_name=Collection.project_ad_log.value,
        )
        audit_log_models = [AuditLogModel(**_) for _ in db_audit_logs]
        audit_log_models.sort(key=lambda x: x.timestamp, reverse=True)
        return [_.model_dump() for _ in audit_log_models]

    @raise_exception(
        "Failed to retrieve assessment status.",
        exception_logger=logger,
    )
    def get_llm_generation_status(
        self,
        data: dict,
    ) -> dict:
        """
        Retrieve the llm generation status of a canvas in project diagram

        This method retrieves the llm generation status of a canvas in project diagram by verifying
        the provided project ID.

        Args:
            data (dict): A dictionary containing the request data. Must include the `project_id`.
            permissions (List[str]): A list of permissions required to access the project.

        Returns:
            status: An integer dictating the status of llm generation status of a canvas.

        Raises:
            Exception: If the project ID is invalid, the project is not found, or the user lacks permissions.
        """
        project_id = data["project_id"]
        canvas_id = data["canvas_id"]

        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=SYSTEM_USER_INFO,
        )
        project_diagram_model = ProjectADModel(**db_project_ad)

        selected_canvas = next(
            (c for c in project_diagram_model.canvas if c.canvas_id == canvas_id),
            None,
        )
        status = selected_canvas.llm_generation_status if selected_canvas else 0
        status = status if isinstance(status, int) else 0
        ref = (
            (db_project_ad.get("ref") or {}) if isinstance(db_project_ad, dict) else {}
        )
        generation = ref.get("llm_generation") or {}
        generation_state = (generation.get("state") or "").strip().lower()
        active_heartbeat = DiagramLLMJobUtil.get_active_heartbeat(project_id)
        is_stale = self.is_llm_generation_stale(generation)
        has_missing_heartbeat = (
            generation_state == LLM_GENERATION_STATE_RUNNING
            and active_heartbeat is None
            and generation.get("canvas_id") == canvas_id
        )
        if has_missing_heartbeat:
            logger.info(
                "LLM generation pipeline heartbeat expired for project %s.",
                project_id,
            )

        if generation_state == LLM_GENERATION_STATE_RUNNING and (
            has_missing_heartbeat or is_stale
        ):
            error = (
                "Generation pipeline heartbeat expired."
                if has_missing_heartbeat
                else "Generation timed out due to stale heartbeat."
            )
            self.fail_llm_generation(
                project_id=project_id,
                user_info=SYSTEM_USER_INFO,
                error=error,
                canvas_id=canvas_id,
            )
            now_iso = self._now_iso()
            status = 0
            generation_state = LLM_GENERATION_STATE_FAILED
            generation = {
                **generation,
                "state": generation_state,
                "updated_at": now_iso,
                "completed_at": now_iso,
                "expires_at": "",
                "error": error,
            }

        is_running_generation = (
            generation_state == LLM_GENERATION_STATE_RUNNING
            and generation.get("canvas_id") == canvas_id
        )

        if generation_state == LLM_GENERATION_STATE_COMPLETED or status in (2, 100):
            status = 100
            response_state = "SUCCESS"
            # response_status = LLM_GENERATION_STATE_COMPLETED
            percentage = 100
            ready = True
            successful = True
        elif generation_state == LLM_GENERATION_STATE_FAILED:
            response_state = "FAILURE"
            # response_status = LLM_GENERATION_STATE_FAILED
            percentage = 0
            ready = True
            successful = False
        else:
            response_state = "IN_PROGRESS"
            # response_status = LLM_GENERATION_STATE_RUNNING if status == 1 else "idle"
            percentage = max(1, min(99, status)) if is_running_generation else 0
            ready = not is_running_generation
            successful = None

        return {
            "status": status,
            "state": response_state,
            "percentage": percentage,
            "ready": ready,
            "successful": successful,
            "message": generation.get("error") or "",
            "generation": generation,
        }

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(TZINFO).isoformat()

    @staticmethod
    def _parse_iso_datetime(value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=TZINFO)
            return parsed
        except Exception:
            return None

    def get_llm_generation_timeout_seconds(self) -> int:
        return int(
            getattr(settings, "LLM_DIAGRAM_GENERATION_TIMEOUT_SECONDS", 1800) or 1800
        )

    def is_llm_generation_stale(self, generation: dict | None) -> bool:
        generation = generation or {}
        if (
            generation.get("state") or ""
        ).strip().lower() != LLM_GENERATION_STATE_RUNNING:
            return False
        updated_at = self._parse_iso_datetime(generation.get("updated_at"))
        started_at = self._parse_iso_datetime(generation.get("started_at"))
        reference = updated_at or started_at
        if reference is None:
            return True
        deadline = reference + timedelta(
            seconds=self.get_llm_generation_timeout_seconds()
        )
        return datetime.now(TZINFO) > deadline

    def start_llm_generation(
        self,
        *,
        project_id: str,
        canvas_id: str,
        task_id: str,
        generation_type: str,
        user_info: dict,
    ) -> None:
        now_iso = self._now_iso()
        timeout_seconds = self.get_llm_generation_timeout_seconds()
        self.update_one(
            {"project_id": project_id},
            payload={
                "canvas.$[canvas].llm_generation_status": 1,
                "ref.llm_generation": {
                    "state": LLM_GENERATION_STATE_RUNNING,
                    "task_id": task_id,
                    "canvas_id": canvas_id,
                    "generation_type": generation_type,
                    "started_at": now_iso,
                    "updated_at": now_iso,
                    "expires_at": (
                        datetime.now(TZINFO) + timedelta(seconds=timeout_seconds)
                    ).isoformat(),
                    "completed_at": "",
                    "error": "",
                    "messages": ["LLM generation job was queued."],
                },
            },
            array_filters=[
                {"canvas.canvas_id": canvas_id},
            ],
            user_info=user_info,
        )

    def heartbeat_llm_generation(
        self,
        *,
        project_id: str,
        task_id: str,
        user_info: dict,
    ) -> None:
        db_project_ad = self.get_one(
            {"project_id": project_id},
            raise_if_not_found=True,
            user_info=user_info,
        )
        ref = (
            (db_project_ad.get("ref") or {}) if isinstance(db_project_ad, dict) else {}
        )
        generation = ref.get("llm_generation") or {}
        if generation.get("task_id") != task_id:
            return
        self.update_one(
            {"project_id": project_id},
            payload={
                "ref.llm_generation.updated_at": self._now_iso(),
                "ref.llm_generation.messages": ["LLM generation job is still running."],
            },
            user_info=user_info,
        )

    def complete_llm_generation(
        self,
        *,
        project_id: str,
        task_id: str,
        user_info: dict,
    ) -> None:
        now_iso = self._now_iso()
        self.update_one(
            {"project_id": project_id},
            payload={
                "ref.llm_generation.state": LLM_GENERATION_STATE_COMPLETED,
                "ref.llm_generation.updated_at": now_iso,
                "ref.llm_generation.completed_at": now_iso,
                "ref.llm_generation.expires_at": "",
                "ref.llm_generation.error": "",
                "ref.llm_generation.messages": [
                    "LLM generation completed successfully."
                ],
            },
            user_info=user_info,
        )

    def fail_llm_generation(
        self,
        *,
        project_id: str,
        user_info: dict,
        error: str,
        canvas_id: str | None = None,
    ) -> None:
        now_iso = self._now_iso()
        payload = {
            "ref.llm_generation.state": LLM_GENERATION_STATE_FAILED,
            "ref.llm_generation.updated_at": now_iso,
            "ref.llm_generation.completed_at": now_iso,
            "ref.llm_generation.expires_at": "",
            "ref.llm_generation.error": error,
            "ref.llm_generation.messages": [error],
        }
        array_filters = None
        if canvas_id:
            payload["canvas.$[canvas].llm_generation_status"] = 0
            array_filters = [{"canvas.canvas_id": canvas_id}]
        update_kwargs = {
            "payload": payload,
            "user_info": user_info,
        }
        if array_filters:
            update_kwargs["array_filters"] = array_filters
        self.update_one({"project_id": project_id}, **update_kwargs)

    @raise_exception(
        "Failed to update node.",
        exception_logger=logger,
    )
    def update_node(
        self,
        data: dict,
        reserved_keys: list[str],
    ) -> list[dict]:
        """Updates a node.

        This method updates a node for a project diagram based on the provided data. It ensures that
        the request is authenticated and authorized to perform the update. It raises an exception if
        the update fails.

        Args:
            data (dict): A dictionary containing the data for updating the node, including
            'project_id', 'canvas_id', 'node' and 'node_id'.
            permissions (List[str]): A list of permissions required for the operation.
            reserved_keys (List[str]): A list of keys that should not be updated.

        Returns:
            List[dict]: A list containing the results of the database updates.

        Raises:
            Exception: If the update of the node fails.
        """
        project_id: str = data["project_id"]

        canvas_id: str = data["canvas_id"]
        node_id: str = data["node_id"]
        node: dict = data["node"]

        extent = node.get("extent")
        node["extent"] = extent if isinstance(extent, str) else None

        field_data = self.filter_request_data(
            data=node,
            reserved_keys=reserved_keys,
            model=CanvasNodeBaseModel,
        )

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                    "canvas_id": canvas_id,
                    "node_id": node_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad_node,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.update_one(
            {"project_id": project_id},
            payload={
                f"canvas.$[canvas].nodes.$[node].{k}": v for k, v in field_data.items()
            },
            array_filters=[
                {"canvas.canvas_id": canvas_id},
                {"node.id": node_id},
            ],
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to update canvas.",
        exception_logger=logger,
    )
    def update_canvas(
        self,
        data: dict,
        reserved_keys: list[str],
    ) -> list[dict]:
        """Updates a canvas.

        This method updates a canvas for a project diagram based on the provided data. It ensures
        that the request is authenticated and authorized to perform the update. It raises an
        exception if the update fails.

        Args:
            data (dict): A dictionary containing the data for updating the canvas, including
            'project_id', 'canvas_id', 'canvas' and 'canvas_id'.
            permissions (List[str]): A list of permissions required for the operation.
            reserved_keys (List[str]): A list of keys that should not be updated.

        Returns:
            List[dict]: A list containing the results of the database updates.

        Raises:
            Exception: If the update of the canvas fails.
        """
        project_id: str = data["project_id"]

        canvas_id: str = data["canvas_id"]
        canvas: dict = data["canvas"]

        nodes: list = canvas.get("nodes", [])
        for node in nodes:
            extent = node.get("extent")
            node["extent"] = extent if isinstance(extent, str) else None

        field_data = self.filter_request_data(
            data=canvas,
            reserved_keys=reserved_keys,
            model=CanvasBaseModel,
        )

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                    "canvas_id": canvas_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad_canvas,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.update_one(
            {"project_id": project_id},
            payload={f"canvas.$[canvas].{k}": v for k, v in field_data.items()},
            array_filters=[
                {"canvas.canvas_id": canvas_id},
            ],
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to update edge.",
        exception_logger=logger,
    )
    def update_edge(
        self,
        data: dict,
        reserved_keys: list[str],
    ) -> list[dict]:
        """Updates an edge.

        This method updates an edge for a project diagram based on the provided data. It ensures
        that the request is authenticated and authorized to perform the update. It raises an
        exception if the update fails.

        Args:
            data (dict): A dictionary containing the data for updating the edge, including
            'project_id', 'canvas_id', 'edge' and 'edge_id'.
            permissions (List[str]): A list of permissions required for the operation.
            reserved_keys (List[str]): A list of keys that should not be updated.

        Returns:
            List[dict]: A list containing the results of the database updates.

        Raises:
            Exception: If the update of the edge fails.
        """
        project_id: str = data["project_id"]

        canvas_id: str = data["canvas_id"]
        edge_id: str = data["edge_id"]
        edge: dict = data["edge"]

        field_data = self.filter_request_data(
            data=edge,
            reserved_keys=reserved_keys,
            model=CanvasEdgeBaseModel,
        )

        audit_log_model = AuditLogModel(
            action=AuditLogAction.update.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                    "canvas_id": canvas_id,
                    "edge_id": edge_id,
                },
                "value": field_data,
            },
            targetKey=AuditLogTargetKey.project_ad_edge,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )

        res1 = self.update_one(
            {"project_id": project_id},
            payload={
                f"canvas.$[canvas].edges.$[edge].{k}": v for k, v in field_data.items()
            },
            array_filters=[
                {"canvas.canvas_id": canvas_id},
                {"edge.id": edge_id},
            ],
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.db_log_ad_service.update_one(
            {"logId": audit_log_model.logId},
            payload={
                **audit_log_model.model_dump(),
            },
            user_info=SYSTEM_USER_INFO,
            upsert=True,
            collection_name=Collection.project_ad_log.value,
        )
        return [res1, res2]
