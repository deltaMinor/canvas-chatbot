from typing import Literal

from pydantic import BaseModel, Field


class LayoutBbox(BaseModel):
    x: float = 0
    y: float = 0
    w: float = 0
    h: float = 0


class LayoutCenter(BaseModel):
    x: float = 0
    y: float = 0


class DiagramLayoutHintNode(BaseModel):
    hint_id: str = ""
    label_text: str = ""
    icon_guess: str = ""
    confidence: float = 0
    bbox: LayoutBbox = Field(default_factory=LayoutBbox)
    center: LayoutCenter = Field(default_factory=LayoutCenter)
    parent_hint_id: str | None = None


class DiagramLayoutHintEdge(BaseModel):
    source_hint_id: str = ""
    target_hint_id: str = ""
    confidence: float = 0


class DiagramLayoutHintImage(BaseModel):
    width: int = 0
    height: int = 0


class DiagramLayoutHints(BaseModel):
    image: DiagramLayoutHintImage = Field(default_factory=DiagramLayoutHintImage)
    nodes: list[DiagramLayoutHintNode] = Field(default_factory=list)
    containers: list[DiagramLayoutHintNode] = Field(default_factory=list)
    edges: list[DiagramLayoutHintEdge] = Field(default_factory=list)


class DiagramNodeAnchor(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float = 0
    layout_lock: Literal["hard", "soft", "none"] = "none"
