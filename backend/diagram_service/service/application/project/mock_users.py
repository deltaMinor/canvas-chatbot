import logging
import uuid
from datetime import datetime

from django.conf import settings
from gridfs import GridFSBucket
from pymongo import MongoClient

from shared_libs.exceptions.api_exceptions import BadRequest, NotFound, Unauthorized

logger = logging.getLogger(__name__)

MOCK_USER_HEADER = "X-Mock-User-Id"

MOCK_USERS_COLLECTION_NAME = "mock_users"
PROJECT_AD_COLLECTION_NAME = "project_ad"

PROJECTS_COLLECTION_NAME = "projects"

PROJECT_AD_FILE_BUCKET_NAME = "project_ad_file"

DEFAULT_DIAGRAM_QUOTA = 5

DEFAULT_MOCK_USERS: list[dict] = [
    {
        "user_id": "user_demo",
        "username": "demo",
        "display_name": "Demo User",
        "is_admin": False,
        "project_id": "project_17206c2a-06f8-49f1-b775-0e60adc22a74",
    },
    {
        "user_id": "user_alice",
        "username": "alice",
        "display_name": "Alice Chen",
        "is_admin": False,
        "project_id": "project_alice_9f18f3c2",
    },
    {
        "user_id": "user_bob",
        "username": "bob",
        "display_name": "Bob Martinez",
        "is_admin": False,
        "project_id": "project_bob_5e2a7d41",
    },
    {
        "user_id": "user_admin",
        "username": "admin",
        "display_name": "Priya Admin",
        "is_admin": True,
        "project_id": "project_admin_c7b0a916",
    },
]


def _get_db():
    client = MongoClient(
        settings.DB_URL,
        connectTimeoutMS=5000,
        serverSelectionTimeoutMS=10000,
    )
    return client[settings.DB_NAME]


def _get_mock_users_collection():
    return _get_db()[MOCK_USERS_COLLECTION_NAME]


def _get_project_ad_collection():
    return _get_db()[PROJECT_AD_COLLECTION_NAME]


def ensure_seeded() -> None:
    collection = _get_mock_users_collection()
    if collection.estimated_document_count() > 0:
        return

    now = datetime.now(settings.TZINFO)
    for user in DEFAULT_MOCK_USERS:
        collection.update_one(
            {"user_id": user["user_id"]},
            {"$setOnInsert": {**user, "created_at": now}},
            upsert=True,
        )


def _diagram_quota_for_project(project_id: str) -> dict:
    project_ad = (
        _get_project_ad_collection().find_one(
            {"project_id": project_id},
            {"diagrams_generated": 1, "diagram_quota": 1},
        )
        or {}
    )

    diagrams_generated_raw = project_ad.get("diagrams_generated")
    diagrams_generated_list = (
        diagrams_generated_raw if isinstance(diagrams_generated_raw, list) else []
    )
    diagrams_generated_total = sum(
        (entry.get("amount") or 0) for entry in diagrams_generated_list if isinstance(entry, dict)
    )

    return {
        "diagrams_generated": diagrams_generated_total,
        "diagram_quota": project_ad.get("diagram_quota", DEFAULT_DIAGRAM_QUOTA),
    }


def list_users() -> list[dict]:
    """Returns every mock user, each annotated with their project's current
    `diagram_quota`/`diagrams_generated` so the frontend's user switcher and
    admin table can render both in a single request.
    """
    ensure_seeded()

    users = []
    for user in _get_mock_users_collection().find({}, {"_id": 0}).sort("username", 1):
        users.append({**user, **_diagram_quota_for_project(user["project_id"])})
    return users


def get_user(user_id: str) -> dict | None:
    ensure_seeded()
    return _get_mock_users_collection().find_one({"user_id": user_id}, {"_id": 0})


def resolve_requesting_user(request) -> dict | None:
    """Resolves the mock user identified by the `MOCK_USER_HEADER` on an
    incoming request, or None if the header is missing/unrecognized.
    """
    user_id = (request.headers.get(MOCK_USER_HEADER) or "").strip()
    if not user_id:
        return None
    return get_user(user_id)


def require_admin(request) -> dict:
    """Resolves the requesting mock user and raises `Unauthorized` unless
    they exist and are an admin. Used to gate `diagram_quota` management.
    """
    requesting_user = resolve_requesting_user(request)
    if not requesting_user:
        raise Unauthorized(
            f"Missing or unrecognized '{MOCK_USER_HEADER}' header. "
            "Pick a mock user in the app before retrying."
        )
    if not requesting_user.get("is_admin"):
        raise Unauthorized("Admin access required to manage diagram quotas.")
    return requesting_user


def set_diagram_quota(user_id: str, diagram_quota: int) -> dict:
    target_user = get_user(user_id)
    if not target_user:
        raise NotFound(f"No mock user found for user_id '{user_id}'.")

    if not isinstance(diagram_quota, int) or isinstance(diagram_quota, bool) or diagram_quota < 0:
        raise BadRequest("diagram_quota must be a non-negative integer.")

    project_id = target_user["project_id"]
    _get_project_ad_collection().update_one(
        {"project_id": project_id},
        {"$set": {"project_id": project_id, "diagram_quota": diagram_quota}},
        upsert=True,
    )

    return {**target_user, **_diagram_quota_for_project(project_id)}


def create_user() -> dict:
    ensure_seeded()
    collection = _get_mock_users_collection()

    new_index = collection.count_documents({}) + 1
    user = {
        "user_id": f"user_{uuid.uuid4().hex}",
        "username": f"user{new_index}",
        "display_name": f"User {new_index}",
        "is_admin": False,
        "project_id": f"project_{uuid.uuid4()}",
    }
    collection.insert_one({**user, "created_at": datetime.now(settings.TZINFO)})

    return {**user, **_diagram_quota_for_project(user["project_id"])}


def delete_user(user_id: str) -> None:
    target_user = get_user(user_id)
    if not target_user:
        raise NotFound(f"No mock user found for user_id '{user_id}'.")

    mock_users_collection = _get_mock_users_collection()
    if mock_users_collection.estimated_document_count() <= 1:
        raise BadRequest("Cannot delete the last remaining mock user.")
    if target_user.get("is_admin") and mock_users_collection.count_documents(
        {"is_admin": True}
    ) <= 1:
        raise BadRequest("Cannot delete the last remaining admin user.")

    project_id = target_user["project_id"]
    db = _get_db()

    mock_users_collection.delete_one({"user_id": user_id})
    db[PROJECT_AD_COLLECTION_NAME].delete_one({"project_id": project_id})
    db[PROJECTS_COLLECTION_NAME].delete_one({"project_id": project_id})

    file_ids = [
        doc["_id"]
        for doc in db[f"{PROJECT_AD_FILE_BUCKET_NAME}.files"].find(
            {"project_id": project_id}, {"_id": 1}
        )
    ]
    if file_ids:
        bucket = GridFSBucket(db, bucket_name=PROJECT_AD_FILE_BUCKET_NAME)
        for file_id in file_ids:
            try:
                bucket.delete(file_id)
            except Exception:
                logger.warning(
                    "Failed to delete project_ad_file %s for project %s.",
                    file_id,
                    project_id,
                    exc_info=True,
                )
