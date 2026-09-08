import logging

from django.conf import settings
from pymongo import MongoClient
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from shared_libs.templates.message_template import success

logger = logging.getLogger(__name__)

# This demo build removes the multi-project "application_service" entirely
# and only ever works with a single, fixed project. On first request this
# view auto-creates a minimal project document (mirroring the shape the
# frontend's Project interface expects) directly via pymongo, so a separate
# service/database is not required.
PROJECT_COLLECTION_NAME = "projects"
PROJECT_AD_COLLECTION_NAME = "project_ad"


def _get_projects_collection():
    # Match the connect/selection timeouts used elsewhere in this codebase
    # (see shared_libs' Mongo repository config) so a database outage fails
    # fast with a clean error instead of hanging the request.
    client = MongoClient(
        settings.DB_URL,
        connectTimeoutMS=5000,
        serverSelectionTimeoutMS=10000,
    )
    db = client[settings.DB_NAME]
    return db[PROJECT_COLLECTION_NAME]


def _get_diagrams_generated(project_id: str) -> int:
    client = MongoClient(
        settings.DB_URL,
        connectTimeoutMS=5000,
        serverSelectionTimeoutMS=10000,
    )
    db = client[settings.DB_NAME]
    project_ad = db[PROJECT_AD_COLLECTION_NAME].find_one(
        {"project_id": project_id}, {"diagrams_generated": 1}
    )
    return (project_ad or {}).get("diagrams_generated") or 0


def _default_project(project_id: str) -> dict:
    return {
        "project_id": project_id,
        "project_name": "Diagram Canvas Chatbot Demo",
        "project_status": "active",
        "project_progress": {
            "architecture_diagram": 0,
        },
        "project_settings": {
            "generation": {
                "allowMasterRegisterGeneration": False,
            },
        },
    }


class ProjectAPIView(APIView):
    """Returns (and lazily creates) the single demo project.

    This intentionally bypasses the full authentication/celery/producer
    stack used elsewhere in this service: it exists only to satisfy the
    frontend's generic `ProjectInitializer`, which expects a `project`
    object to exist at this URL before rendering the diagram canvas.
    """

    def get(self, request: Request):
        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response(
                {"message": "project_id is required.", "success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        collection = _get_projects_collection()
        project = collection.find_one({"project_id": project_id}, {"_id": 0})
        if not project:
            project = _default_project(project_id)
            collection.update_one(
                {"project_id": project_id},
                {"$set": project},
                upsert=True,
            )

        project["diagrams_generated"] = _get_diagrams_generated(project_id)

        return Response(
            success("Project is retrieved successfully.", {"project": project}),
            status=status.HTTP_200_OK,
        )
