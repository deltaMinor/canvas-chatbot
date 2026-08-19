from typing import Protocol

from .project_input_model_protocol import ProjectInputModelProtocol


class ModelExtractionProtocol(Protocol):
    project_input_model: ProjectInputModelProtocol
