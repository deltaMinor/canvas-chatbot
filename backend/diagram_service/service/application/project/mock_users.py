import logging
from datetime import datetime

from django.conf import settings
from pymongo import MongoClient

from shared_libs.exceptions.api_exceptions import BadRequest, NotFound, Unauthorized

logger = logging.getLogger(__name__)

MOCK_USER_HEADER = "X-Mock-User-Id"

MOCK_USERS_COLLECTION_NAME = "mock_users"
PROJECT_AD_COLLECTION_NAME = "project_ad"

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
        "user_id": "user_1",
        "username": "User 1",
        "display_name": "User 1",
        "is_admin": False,
        "project_id": "project_4c1c274c-a0d1-4b04-9587-5201e4ff737f",
    },
    {
        "user_id": "user_2",
        "username": "User 2",
        "display_name": "User 2",
        "is_admin": False,
        "project_id": "project_e98fa4d9-8efc-4b0e-a3b5-cb6f38ec85dd",
    },
    {
        "user_id": "admin",
        "username": "admin",
        "display_name": "Admin",
        "is_admin": True,
        "project_id": "project_72a954bc-459d-4af6-8d92-48ea88769443",
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
