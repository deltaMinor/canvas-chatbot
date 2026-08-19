from collections.abc import Callable

from pydantic import BaseModel, ConfigDict, Field

from shared_libs.constants.llm import LlmCatalogEntry
from shared_libs.models.llm_task_context import LlmTaskContext
from shared_libs.protocols.llm_mongo_store_protocol import LlmMongoStoreProtocol


class MongoPollingLLMContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    response_mode: str | None = None
    canonical_llm: str = ""
    llm_model_config: LlmCatalogEntry = Field(default_factory=dict)
    name: str | None = None
    task_context: LlmTaskContext | None = None
    project_id: str = ""
    assessment_id: str = ""
    mongo_store: LlmMongoStoreProtocol | None = None
    wait_timeout: int | None = None
    generation_heartbeat_getter: Callable[[], dict | None] | None = None
    progress_info_reporter: Callable[..., None] | None = None
