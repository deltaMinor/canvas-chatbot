from enum import Enum


class LlmExecutionMode(str, Enum):
    API = "api"
    LOCAL = "local"
    BATCH = "batch"
    BEDROCK = "bedrock"
    BEDROCK_BATCH = "bedrock_batch"


__all__ = [
    "LlmExecutionMode",
]
