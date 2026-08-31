import base64
import json
import logging
import os
import shutil
import uuid
import zipfile
from datetime import datetime

from celery import Celery
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils.datastructures import MultiValueDict

from shared_libs.constants.architecture_diagram import (
    PROJECT_AD_FILE_SOURCE_DIRECT,
    PROJECT_AD_FILE_SOURCES,
    PROJECT_AD_FILE_TYPE_CACTI,
    PROJECT_AD_FILE_TYPE_DIAGRAM,
    PROJECT_AD_FILE_TYPE_MODULE,
    PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
    PROJECT_AD_FILE_TYPE_TERRAFORM,
    PROJECT_AD_FILE_TYPE_XML,
)
from shared_libs.constants.database import MAX_FILE_COUNT
from shared_libs.decorators import raise_exception
from shared_libs.domain import DatabaseLogService, ProjectADFileService
from shared_libs.exceptions.api_exceptions import BadRequest, NotFound
from shared_libs.infrastructure.producer.service import Producer
from shared_libs.infrastructure.remote_file_repository.service import (
    RemoteFileRepository,
)
from shared_libs.infrastructure.remote_repository.service import RemoteRepository
from shared_libs.lib.file_manager import FileManager
from shared_libs.lib.file_validator import FileValidator
from shared_libs.models.base_models import (
    AuditLogModel,
    CanvasDataBaseModel,
    ProducerDataModel,
)
from shared_libs.producers.producer_data import (
    producer_data_database_log_ad,
    producer_data_project_ad_file,
)
from shared_libs.types.auditLog import AuditLogAction, AuditLogTargetKey
from shared_libs.types.enum import CanvasType, Collection
from shared_libs.constants import SYSTEM_USER_INFO

TZINFO = settings.TZINFO
logger = logging.getLogger(__name__)


class ProjectADFileApplicationService(ProjectADFileService):
    audit_log_collection_name = Collection.project_ad_file_log.value

    def __init__(
        self,
        celery_app: Celery,
        *args,
        **kwargs,
    ):
        super().__init__(
            repository=RemoteFileRepository(
                producer=Producer(
                    producer_data_model=ProducerDataModel(
                        **producer_data_project_ad_file,
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

    def _build_files_response(
        self,
        project_id: str,
        file_type: str,
    ) -> dict:
        files = self._read_files(
            project_id=project_id,
            file_type=file_type,
        )
        return {
            "project_id": project_id,
            "files": [{k: v for k, v in file.items() if k != "data"} for file in files],
            "selected_file_id": "",
        }

    def _read_files(
        self,
        project_id: str,
        file_type: str,
    ) -> list[dict]:
        return self.get_many_files(
            {
                "project_id": project_id,
                "file_type": file_type,
            },
        )

    @raise_exception("Failed to retrieve project AD files.", exception_logger=logger)
    def get_files(
        self,
        data: dict,
        file_type: str,
        *,
        as_response: bool = False,
    ) -> list[dict] | dict:
        project_id = data["project_id"]
        if as_response:
            return self._build_files_response(project_id, file_type)

        return self._read_files(
            project_id=project_id,
            file_type=file_type,
        )

    @raise_exception("Failed to retrieve project AD file.", exception_logger=logger)
    def get_file(
        self,
        data: dict,
        file_type: str,
    ) -> dict:
        project_id = data["project_id"]
        file_id = data["file_id"]

        file = self.get_one_file(
            {
                "project_id": project_id,
                "file_id": file_id,
                "file_type": file_type,
            },
        )
        if not file:
            raise NotFound(f"No file found for file_id {file_id}.")

        return {
            "file_id": file["file_id"],
            "filename": file["filename"],
            "content_type": file.get("content_type") or "application/octet-stream",
            "data": file["data"],
        }

    def _check_file_count_limit(
        self,
        project_id: str,
        file_type: str,
        files: list[UploadedFile],
    ) -> None:
        db_files = self.get_many_files(
            {
                "project_id": project_id,
                "file_type": file_type,
            },
        )
        if len(db_files) + len(files) > MAX_FILE_COUNT:
            raise BadRequest(
                f"Upload limit exceeded. Maximum {MAX_FILE_COUNT} files allowed"
            )

    def _remove_files(
        self,
        project_id: str,
        file_type: str,
        file_id_list: list[str],
    ) -> list[dict]:
        audit_log_model = AuditLogModel(
            action=AuditLogAction.delete.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                    "file_id__list": file_id_list,
                },
                "value": {"deleted_file_ids": file_id_list},
            },
            targetKey=AuditLogTargetKey.project_ad_file.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )
        res1 = self.delete_many_files(
            query_dict={
                "project_id": project_id,
                "file_type": file_type,
                "file_id": {
                    "$in": file_id_list,
                },
            },
        )
        res2 = self.write_audit_log(
            audit_log_service=self.db_log_ad_service,
            audit_log_model=audit_log_model,
        )
        return [res1, res2]

    @raise_exception("Failed to delete project AD files.", exception_logger=logger)
    def delete_files(
        self,
        data: dict,
        file_type: str,
    ) -> list[dict]:
        project_id = data["project_id"]
        return self._remove_files(
            project_id=project_id,
            file_type=file_type,
            file_id_list=data["file_id_list"],
        )

    def _write_file(
        self,
        project_id: str,
        filename: str,
        file_id: str,
        file_type: str,
        content_type: str,
        decoded_file: str,
        source: str = PROJECT_AD_FILE_SOURCE_DIRECT,
    ):
        file_metadata = {
            "file_id": file_id,
            "filename": filename,
            "file_type": file_type,
            "content_type": content_type,
            "project_id": project_id,
            "source": source,
            "timestamp": datetime.now(TZINFO),
        }
        audit_log_model = AuditLogModel(
            action=AuditLogAction.create.value,
            fieldChanges={
                "identifiers": {
                    "project_id": project_id,
                },
                "value": file_metadata,
            },
            targetKey=AuditLogTargetKey.project_ad_file.value,
            user_id=SYSTEM_USER_INFO["user_id"],
            username=SYSTEM_USER_INFO["username"],
            timestamp=datetime.now(TZINFO),
        )
        res1 = self.insert_one_file(
            query_dict={
                "project_id": project_id,
                "filename": filename,
                "file_id": file_id,
                "file_type": file_type,
                "content_type": content_type,
                "source": source,
            },
            decoded_file=decoded_file,
            user_info=SYSTEM_USER_INFO,
        )
        res2 = self.write_audit_log(
            audit_log_service=self.db_log_ad_service,
            audit_log_model=audit_log_model,
        )
        return [res1, res2]

    @raise_exception(
        "Failed to save zipfile in local directory.",
        exception_logger=logger,
    )
    def save_zipfile_in_local_directory(
        self,
        file,
        module_files_dir,
    ):
        try:
            with zipfile.ZipFile(file, "r") as zip_file:
                for member in zip_file.namelist()[1:]:
                    source = zip_file.open(member)
                    base_file_name = os.path.basename(member)
                    if base_file_name:
                        directory = os.path.dirname(member)
                        base_directory_name = os.path.basename(directory)
                        target_dir = os.path.join(module_files_dir, base_directory_name)
                        if not os.path.exists(target_dir):
                            os.makedirs(target_dir)
                        target_file = os.path.join(target_dir, base_file_name)
                        with open(target_file, "wb+") as target:
                            shutil.copyfileobj(source, target)
        except Exception as e:
            logger.error("Failed to save files: %s", e)

    def _insert_module_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        directory_name = data["directory_name"]
        zip_file: UploadedFile = files.get("zip_file")

        raw = FileValidator.read_uploaded_file(zip_file)
        if not FileValidator.is_valid_zip(raw):
            raise BadRequest(f"File {directory_name} is not a valid ZIP archive.")
        decoded_file = base64.b64encode(raw).decode("utf-8")

        return self._write_file(
            project_id=project_id,
            filename=directory_name,
            file_id=f"file_{uuid.uuid4()}",
            file_type=PROJECT_AD_FILE_TYPE_MODULE,
            content_type=zip_file.content_type or "",
            decoded_file=decoded_file,
        )

    def _insert_terraform_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        terraform_files: list[UploadedFile] = files.getlist("file")

        res_arr = []
        for file in terraform_files:
            if not FileValidator.has_allowed_extension(file.name, [".tf", ".hcl"]):
                logger.warning(
                    "Rejected Terraform upload %s: not a .tf or .hcl file.", file.name
                )
                continue
            decoded_file = FileManager.get_decoded_file(file=file)
            if not decoded_file:
                logger.warning("File %s is empty.", file.name)
                continue
            res_arr.extend(
                self._write_file(
                    project_id=project_id,
                    filename=file.name,
                    file_id=f"file_{uuid.uuid4()}",
                    file_type=PROJECT_AD_FILE_TYPE_TERRAFORM,
                    content_type=file.content_type or "",
                    decoded_file=decoded_file,
                )
            )
        return res_arr

    def _insert_cacti_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        cacti_files: list[UploadedFile] = files.getlist("file")
        self._check_file_count_limit(
            project_id, PROJECT_AD_FILE_TYPE_CACTI, cacti_files
        )

        res_arr = []
        for cacti_file_io_buffer in cacti_files:
            if not FileValidator.has_allowed_extension(
                cacti_file_io_buffer.name, [".json"]
            ) and not FileValidator.has_allowed_content_type(
                cacti_file_io_buffer.content_type or "", ["application/json"]
            ):
                raise BadRequest(
                    f"File {cacti_file_io_buffer.name} must be a JSON file."
                )
            raw = FileValidator.read_uploaded_file(cacti_file_io_buffer)
            if not FileValidator.is_valid_json(raw):
                raise BadRequest(
                    f"File {cacti_file_io_buffer.name} must be a valid JSON file."
                )
            cacti_data = FileValidator.parse_json(raw)
            decoded_file = base64.b64encode(
                json.dumps(cacti_data).encode("utf-8")
            ).decode("utf-8")
            res_arr.extend(
                self._write_file(
                    project_id=project_id,
                    filename=cacti_file_io_buffer.name,
                    file_id=f"cacti_{uuid.uuid4()}",
                    file_type=PROJECT_AD_FILE_TYPE_CACTI,
                    content_type=cacti_file_io_buffer.content_type or "",
                    decoded_file=decoded_file,
                )
            )
        return res_arr

    def _get_architecture_canvas(self, project_diagram_file_data: dict) -> dict:
        arch_canvases = []
        for single_canvas in project_diagram_file_data["canvas"]:
            if single_canvas["canvas_type"] != CanvasType.architecture.value:
                continue
            for node in single_canvas["nodes"]:
                extent = node.get("extent")
                node["extent"] = extent if isinstance(extent, str) else None
            arch_canvases.append(single_canvas)

        if len(arch_canvases) != 1:
            raise BadRequest(
                "Invalid project diagram. Expected exactly one architecture canvas."
            )

        return arch_canvases[0]

    def _insert_diagram_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        project_diagram_files: list[UploadedFile] = files.getlist("file")
        self._check_file_count_limit(
            project_id,
            PROJECT_AD_FILE_TYPE_DIAGRAM,
            project_diagram_files,
        )

        res_arr = []
        for project_diagram_file_io_buffer in project_diagram_files:
            if not FileValidator.has_allowed_extension(
                project_diagram_file_io_buffer.name, [".json"]
            ) and not FileValidator.has_allowed_content_type(
                project_diagram_file_io_buffer.content_type or "", ["application/json"]
            ):
                raise BadRequest(
                    f"File {project_diagram_file_io_buffer.name} must be a JSON file."
                )
            raw = FileValidator.read_uploaded_file(project_diagram_file_io_buffer)
            if not FileValidator.is_valid_json(raw):
                raise BadRequest(
                    f"File {project_diagram_file_io_buffer.name} must be a valid JSON file."
                )
            project_diagram_file_data = FileValidator.parse_json(raw)
            arch_canvas = self._get_architecture_canvas(project_diagram_file_data)
            diagram = {
                "nodes": arch_canvas["nodes"],
                "edges": arch_canvas["edges"],
                "viewport": arch_canvas["viewport"],
            }
            diagram_data = CanvasDataBaseModel(**diagram).model_dump()
            decoded_file = base64.b64encode(
                json.dumps(diagram_data).encode("utf-8")
            ).decode("utf-8")
            res_arr.extend(
                self._write_file(
                    project_id=project_id,
                    filename=project_diagram_file_io_buffer.name,
                    file_id=f"file_{uuid.uuid4()}",
                    file_type=PROJECT_AD_FILE_TYPE_DIAGRAM,
                    content_type=project_diagram_file_io_buffer.content_type or "",
                    decoded_file=decoded_file,
                )
            )
        return res_arr

    def _insert_xml_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        xml_files: list[UploadedFile] = files.getlist("file")
        self._check_file_count_limit(project_id, PROJECT_AD_FILE_TYPE_XML, xml_files)

        res_arr = []
        for xml_file_io_buffer in xml_files:
            raw = FileValidator.read_uploaded_file(xml_file_io_buffer)
            if FileValidator.xml_root_tag(raw) != "mxfile":
                raise BadRequest("Only mxGraph XML files are allowed.")
            decoded_file = base64.b64encode(raw).decode("utf-8")
            res_arr.extend(
                self._write_file(
                    project_id=project_id,
                    filename=xml_file_io_buffer.name,
                    file_id=f"xml_{uuid.uuid4()}",
                    file_type=PROJECT_AD_FILE_TYPE_XML,
                    content_type=xml_file_io_buffer.content_type or "",
                    decoded_file=decoded_file,
                )
            )
        return res_arr

    def _insert_pdf_document_files(
        self,
        data: dict,
        files: MultiValueDict,
        project_id: str,
    ) -> list[dict]:
        pdf_document_files: list[UploadedFile] = files.getlist("file")
        self._check_file_count_limit(
            project_id, PROJECT_AD_FILE_TYPE_PDF_DOCUMENT, pdf_document_files
        )

        source = data.get("source") or PROJECT_AD_FILE_SOURCE_DIRECT
        if source not in PROJECT_AD_FILE_SOURCES:
            raise BadRequest(
                f"Invalid source '{source}'. Must be one of {PROJECT_AD_FILE_SOURCES}."
            )

        res_arr = []
        for pdf_document_file_io_buffer in pdf_document_files:
            if not FileValidator.is_valid_pdf_upload(pdf_document_file_io_buffer):
                raise BadRequest(
                    f"File {pdf_document_file_io_buffer.name} must be a valid PDF file."
                )
            raw = FileValidator.read_uploaded_file(pdf_document_file_io_buffer)
            decoded_file = base64.b64encode(raw).decode("utf-8")
            res_arr.extend(
                self._write_file(
                    project_id=project_id,
                    filename=pdf_document_file_io_buffer.name,
                    file_id=f"pdf_document_{uuid.uuid4()}",
                    file_type=PROJECT_AD_FILE_TYPE_PDF_DOCUMENT,
                    content_type=pdf_document_file_io_buffer.content_type or "",
                    decoded_file=decoded_file,
                    source=source,
                )
            )
        return res_arr

    @raise_exception("Failed to insert project AD files.", exception_logger=logger)
    def insert_files(
        self,
        data: dict,
        files: MultiValueDict,
        file_type: str,
    ) -> list[dict]:
        project_id = data["project_id"]
        insert_handler_map = {
            PROJECT_AD_FILE_TYPE_MODULE: self._insert_module_files,
            PROJECT_AD_FILE_TYPE_TERRAFORM: self._insert_terraform_files,
            PROJECT_AD_FILE_TYPE_CACTI: self._insert_cacti_files,
            PROJECT_AD_FILE_TYPE_DIAGRAM: self._insert_diagram_files,
            PROJECT_AD_FILE_TYPE_XML: self._insert_xml_files,
            PROJECT_AD_FILE_TYPE_PDF_DOCUMENT: self._insert_pdf_document_files,
        }
        insert_handler = insert_handler_map.get(file_type)
        if insert_handler:
            return insert_handler(
                data=data,
                files=files,
                project_id=project_id,
            )

        raise BadRequest(f"Unsupported project AD file type {file_type}.")
