from typing import Protocol, runtime_checkable


@runtime_checkable
class ProjectRegisterUpdaterProtocol(Protocol):
    def update_assessment_progress(
        self,
        progress: int,
        progress_info: str = "",
    ) -> None: ...


@runtime_checkable
class LLMGeneratorAdapterProtocol(Protocol):
    image_url: str | None

    def generate_path(
        self,
        llm_model,
        output_json_struc,
        image_url: str | None = None,
    ): ...

    def generate_threat_impact(
        self,
        llm_model,
        final_message: str,
    ) -> str: ...


__all__ = [
    "LLMGeneratorAdapterProtocol",
    "ProjectRegisterUpdaterProtocol",
]
