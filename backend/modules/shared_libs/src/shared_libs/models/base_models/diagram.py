from typing import Optional, Self

from pydantic import BaseModel, Field, model_validator

from shared_libs.constants.diagram import BLANK_ARCHITECTURE_CANVAS
from shared_libs.models.model_validators import (
    CanvasDataBaseValidator,
    CanvasEdgeBaseValidator,
    CanvasNodeBaseValidator,
    MasterADTemplateBaseValidator,
    ProjectADBaseValidator,
)

from .chatbot import ConversationBaseModel
from .diagram_file import ProjectADFileBaseModel
from .shared.shared.database import MetadataModel, PatchBaseModel

__all__ = [
    "CanvasBaseModel",
    "CanvasDataBaseModel",
    "CanvasDataViewportBaseModel",
    "CanvasEdgeBaseModel",
    "CanvasNodeBaseModel",
    "CanvasNodeHandle",
    "CanvasNodeMeasured",
    "CanvasXYPosition",
    "LLMGenerationMetadataModel",
    "MasterADTemplateBaseModel",
    "ProjectADBaseModel",
    "ProjectADRefBaseModel",
    "TopologyRunContextBaseModel",
]


class CanvasDataViewportBaseModel(BaseModel):
    x: float | None = Field(default=0)
    y: float | None = Field(default=0)
    zoom: float | None = Field(default=1)


class CanvasXYPosition(BaseModel):
    x: float | None = Field(default=0.0)
    y: float | None = Field(default=0.0)


class CanvasNodeHandle(BaseModel):
    pass


class CanvasNodeMeasured(BaseModel):
    width: float | None = Field(default=0.0)
    height: float | None = Field(default=0.0)


class CanvasNodeBaseModel(
    PatchBaseModel,
    CanvasNodeBaseValidator,
):
    id: str | None = Field(default="")
    #
    style: dict | None = Field(default={})
    className: str | None = Field(default="")
    resizing: bool | None = Field(default=False)
    focusable: bool | None = Field(default=False)
    position: CanvasXYPosition | None = Field(
        default_factory=CanvasXYPosition,
    )
    data: dict | None = Field(default={})
    type: str | None = Field(default="")
    sourcePosition: str | None = Field(default="")
    targetPosition: str | None = Field(default="")
    hidden: bool | None = Field(default=False)
    selected: bool | None = Field(default=False)
    dragging: bool | None = Field(default=False)
    draggable: bool | None = Field(default=True)
    selectable: bool | None = Field(default=True)
    connectable: bool | None = Field(default=True)
    deletable: bool | None = Field(default=True)
    dragHandle: str | None = Field(default="")
    width: float | None = Field(default=None)
    height: float | None = Field(default=None)
    initialWidth: float | None = Field(default=None)
    initialHeight: float | None = Field(default=None)
    parentId: str | None = Field(default="")
    zIndex: int | None = Field(default=0)
    extent: str | list[tuple[float, float]] | None = Field(default=None)
    expandParent: bool | None = Field(default=False)
    ariaLabel: str | None = Field(default="")
    origin: tuple[float, float] | None = Field(default=None)
    handles: list[CanvasNodeHandle] | None = Field(default=None)
    # Internal
    # measured: Optional[CanvasNodeMeasured] = Field(default=None)

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class CanvasEdgeBaseModel(
    PatchBaseModel,
    CanvasEdgeBaseValidator,
):
    id: str | None = Field(default="")
    animated: bool | None = Field(default=False)
    className: str | None = Field(default="")
    data: dict | None = Field(default={})
    deletable: bool | None = Field(default=True)
    hidden: bool | None = Field(default=False)
    interactionWidth: float | None = Field(default=0)
    label: str | None = Field(default="")
    labelBgPadding: list[float] | None = Field(default=[])
    markerEnd: dict | None = Field(default={})
    markerStart: dict | None = Field(default={})
    source: str | None = Field(default="")
    sourceHandle: str | None = Field(default="")
    style: dict | None = Field(default={})
    target: str | None = Field(default="")
    targetHandle: str | None = Field(default="")
    type: str | None = Field(default="")
    zIndex: int | None = Field(default=0)
    selected: bool | None = Field(default=False)

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class CanvasDataBaseModel(
    PatchBaseModel,
    CanvasDataBaseValidator,
):
    nodes: list[CanvasNodeBaseModel] | None = Field(default=[])
    edges: list[CanvasEdgeBaseModel] | None = Field(default=[])
    viewport: Optional["CanvasDataViewportBaseModel"] = Field(
        default_factory=CanvasDataViewportBaseModel,
    )

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class MasterADTemplateBaseModel(
    PatchBaseModel,
    MasterADTemplateBaseValidator,
):
    templateId: str | None = Field(default="")
    templateName: str | None = Field(default="")
    templateImageName: str | None = Field(default="")
    templateData: Optional["CanvasDataBaseModel"] = Field(
        default_factory=CanvasDataBaseModel,
    )

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model


class CanvasBaseModel(CanvasDataBaseModel):
    canvas_id: str | None = Field(default="")
    canvas_name: str | None = Field(default="")
    canvas_type: str | None = Field(default="")
    llm_generation_status: int | None = Field(default=0)
    ref: dict | None = Field(default={})
    view_only: bool | None = Field(default=False)
    warnings: list[dict] = Field(default=[])


class LLMGenerationMetadataModel(BaseModel):
    state: str | None = Field(default="")
    task_id: str | None = Field(default="")
    canvas_id: str | None = Field(default="")
    generation_type: str | None = Field(default="")
    started_at: str | None = Field(default="")
    updated_at: str | None = Field(default="")
    expires_at: str | None = Field(default="")
    completed_at: str | None = Field(default="")
    error: str | None = Field(default="")
    messages: list[str] | None = Field(default=[])


class ProjectADRefBaseModel(BaseModel):
    selected_cacti_file_id: str | None = Field(default="")
    selected_diagram_file_id: str | None = Field(default="")
    image_files: list["ProjectADFileBaseModel"] | None = Field(default=[])
    selected_image_file_id: str | None = Field(default="")
    selected_module_file_id_list: list[str] | None = Field(default=[])
    selected_template_id: str | None = Field(default="")
    selected_terraform_file_id_list: list[str] | None = Field(default=[])
    selected_xml_file_id: str | None = Field(default="")
    llm_generation: Optional["LLMGenerationMetadataModel"] = Field(
        default_factory=LLMGenerationMetadataModel,
    )

class TopologyRunContextBaseModel(BaseModel):
    conversation_id: str
    run_id: str
    address: str
    file_name: str = Field(default="diagram")
    created_at: str


class ProjectADBaseModel(
    PatchBaseModel,
    ProjectADBaseValidator,
):
    ad_version_id: str | None = Field(default="")
    canvas: list["CanvasBaseModel"] | None = Field(
        default_factory=lambda: [CanvasBaseModel.model_validate(BLANK_ARCHITECTURE_CANVAS)]
    )
    conversations: list["ConversationBaseModel"] | None = Field(default=[])
    topology_run_context: list["TopologyRunContextBaseModel"] | None = Field(default=[])
    isCompleted: bool | None = Field(default=False)
    lastCompletedBy: Optional["MetadataModel"] = Field(
        default_factory=MetadataModel,
    )
    ref: Optional["ProjectADRefBaseModel"] = Field(
        default_factory=ProjectADRefBaseModel,
    )

    @model_validator(mode="wrap")
    @classmethod
    def validate_model(
        cls,
        data: dict,
        handler,
    ) -> Self:
        model = cls.get_validated_model(
            data=data,
            handler=handler,
        )
        return model
