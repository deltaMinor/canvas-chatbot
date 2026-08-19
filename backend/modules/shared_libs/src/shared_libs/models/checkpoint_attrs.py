from pydantic import BaseModel, ConfigDict


class CheckpointAttrs(BaseModel):
    """Static attributes for a named assessment benchmark checkpoint."""

    model_config = ConfigDict(frozen=True)

    message: str
    # None = timing-only, no numeric progress update; -1 = failure; 0-100 = percent complete
    progress: int | None = None
