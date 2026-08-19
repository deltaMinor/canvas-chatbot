import json
import logging
from functools import partial
from typing import TYPE_CHECKING, Any, cast

from engine_libs.lib.bases import LLMSingleTurnBase
from langchain_core.messages import HumanMessage

from shared_libs.decorators import raise_exception

if TYPE_CHECKING:
    from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder

logger = logging.getLogger(__name__)


class LLMTopologySingle(LLMSingleTurnBase):
    ENTITY_ONLY_STRUC = """
    {
      "nodes": list[
        {
          "id": str,
          "parentId": str,
          "type": enum["clusterNode", "infoNode"],
          "data": {
            "icon": str,
            "label": str,
            "replicas_hint": str
          },
          "confidence": float
        }
      ]
    }
    """

    DEDUPE_AND_GROUNDING_RULES = """
    Diagram extraction rules:
    1. Deduplicate aggressively by service identity in the same scope:
       identity key = (icon, label, parentId).
    2. If the same service appears multiple times in the same scope and the image is ambiguous,
       keep one node and set data.replicas_hint (for example: "2", "2+", or "unknown-multiple").
    3. Only keep multiple same-service nodes in one scope when the diagram clearly shows
       separate instances.
    4. Use only icon names from the provided icon list.
    5. Grounding example: Route53 must map to DNS/global entry points, not subnet resources.
    6. Output confidence between 0 and 1 for each node.
    """

    def __init__(self, prompt: "LLMPromptBuilder"):
        self.promptsClass = prompt
        self.prompt_template_str = self.promptsClass.prompt[0]
        self.image_url = None
        self.icon_list = ""
        self.cluster_icon_list = ""

    @raise_exception(
        "Failed to set system in llm topology single prompt.",
        exception_logger=logger,
    )
    def set_system(
        self,
        diagram_image: str | None,
        description: str | None,
        icon_list: str,
        cluster_icon_list: str,
    ):
        prompt = str(self.prompt_template_str)
        self.image_url = diagram_image
        self.description = description
        self.icon_list = icon_list
        self.cluster_icon_list = cluster_icon_list
        self.final_message = partial(
            prompt.format,
            icon_list=icon_list,
            cluster_icon_list=cluster_icon_list,
            system_description=description,
        )

    def _build_message(self, text: str, image_url: str | None):
        message_content: list[dict[str, Any]] = [{"type": "text", "text": text}]
        if image_url is not None:
            message_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": image_url},
                }
            )
        return HumanMessage(content=cast(list[str | dict[Any, Any]], message_content))

    @raise_exception(
        "Failed in two-pass topology generation.",
        exception_logger=logger,
    )
    def generate_path(
        self,
        llm_model,
        output_json_struc,
        image_url=None,
    ):
        base_prompt = str(self.prompt_template_str).format(
            icon_list=self.icon_list,
            cluster_icon_list=self.cluster_icon_list,
            system_description=self.description,
            result_struc=output_json_struc,
        )

        pass1_prompt = (
            f"{base_prompt}\n\n"
            "Pass 1 task: extract entities and containers only. "
            "Do not output edges.\n"
            f"{self.DEDUPE_AND_GROUNDING_RULES}\n"
            f"Return only this JSON structure:\n{self.ENTITY_ONLY_STRUC}"
        )
        pass1_message = self._build_message(pass1_prompt, image_url)
        pass1_result = llm_model.extract_json(llm_model.invoke([pass1_message]))

        if not isinstance(pass1_result, dict) or not isinstance(
            pass1_result.get("nodes"), list
        ):
            logger.warning(
                "[ RR-LLM ] Diagram pass-1 extraction invalid. Falling back to single-pass output."
            )
            fallback_prompt = (
                f"{base_prompt}\n\n{self.DEDUPE_AND_GROUNDING_RULES}\n"
                "Return only valid JSON."
            )
            fallback_message = self._build_message(fallback_prompt, image_url)
            return llm_model.extract_json(llm_model.invoke([fallback_message]))

        frozen_entities = {"nodes": pass1_result.get("nodes", [])}
        frozen_entities_json = json.dumps(frozen_entities, ensure_ascii=True)
        pass2_prompt = (
            f"{base_prompt}\n\n"
            "Pass 2 task: generate final nodes and edges using ONLY these frozen entities. "
            "Do not introduce new services/icons outside this list.\n"
            f"Frozen entities:\n{frozen_entities_json}\n"
            f"{self.DEDUPE_AND_GROUNDING_RULES}\n"
            "Return only valid JSON in the required final structure."
        )
        pass2_message = self._build_message(pass2_prompt, image_url)
        return llm_model.extract_json(llm_model.invoke([pass2_message]))
