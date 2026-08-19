from datetime import datetime

from pydantic import BaseModel, Field

from shared_libs.lib_config import TZINFO


class MetadataDetails(BaseModel):
    timestamp: datetime | None = Field(
        default_factory=lambda: datetime.now(TZINFO),
    )
    user_id: str
    username: str


class Metadata(BaseModel):
    created_on: MetadataDetails
    modified_on: MetadataDetails
