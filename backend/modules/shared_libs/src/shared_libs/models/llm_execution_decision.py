from pydantic import BaseModel, ConfigDict, Field

from shared_libs.constants.llm import LlmCatalogEntry
from shared_libs.types import LlmExecutionMode


class LlmExecutionDecision(BaseModel):
    model_config = ConfigDict(frozen=True)

    requested_llm: str
    canonical_llm: str
    llm_model_config: LlmCatalogEntry = Field(...)
    mode: LlmExecutionMode | None = None
    source: str
    reason: str
