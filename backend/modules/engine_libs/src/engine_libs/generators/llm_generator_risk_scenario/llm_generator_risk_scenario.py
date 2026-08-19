import hashlib
import logging
import uuid
from typing import TYPE_CHECKING, Any

from engine_libs.config.llm_config import (
    PAREN_SUFFIX_RE,
    PROGRESS_THRESHOLDS,
)
from engine_libs.config.runtime_config import MODULE_TEST
from engine_libs.lib.bases.llm_generator_base import LLMGeneratorBase
from engine_libs.lib.llm_prompt_builder import LLMPromptBuilder
from engine_libs.lib.threat_quality_checker import ThreatQualityPipeline
from engine_libs.lib.threat_scc_checker import ThreatSccCheckerPipeline
from engine_libs.llm_runtime.resolver import LlmExecutionResolver
from engine_libs.struc import AttackPathStruc

from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import BadRequest
from shared_libs.models.base_models import ProjectRiskScenario
from shared_libs.models.base_models.mitre import MitreParsedDocs
from shared_libs.models.llm_generator_context import (
    GeneratorConfiguration,
    LLMGeneratorProgressContext,
    LLMGeneratorRuntimeContext,
)
from shared_libs.models.mitre import KillChainPhase
from shared_libs.types.enum import (
    AssessmentLifecycle,
    KnowledgebaseSource,
    ProgressStage,
)

from .llm_single_scenario import LLMGenerationSingle

ProjectRegisterUpdater = Any


logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from engine_libs.llm_runtime.context import LlmTaskContext

    from shared_libs.protocols import (
        LlmMongoStoreProtocol,
        ProjectInputModelProtocol,
        ThreatQualityPipelineProtocol,
    )


class LLMRiskScenarioGenerator(LLMGeneratorBase):
    @staticmethod
    def _assert_gen_option_name(*, value: str) -> str:
        if value.strip():
            return value
        raise BadRequest("configuration.role_label is required for gen_option_name.")

    @staticmethod
    def _read_dataflow_vertices(project_input_model) -> list[dict]:
        """Return ``dataflow.vertices`` regardless of how the model was passed in."""
        if not project_input_model:
            return []
        if isinstance(project_input_model, dict):
            dataflow = project_input_model.get("dataflow") or {}
            return dataflow.get("vertices") or []
        try:
            return project_input_model.get("dataflow.vertices") or []
        except Exception:  # noqa: BLE001
            return []

    @staticmethod
    def _resolve_vertex(
        raw_component: str,
        node_id_to_node: dict[str, dict[str, str]],
        node_name_to_node: dict[str, dict[str, str]],
    ) -> dict[str, str] | None:
        """Resolve `raw_component` (as the LLM emitted it) to a canonical vertex."""
        if not raw_component:
            return None
        resolved = node_id_to_node.get(raw_component) or node_name_to_node.get(
            raw_component
        )
        if resolved:
            return resolved

        match = PAREN_SUFFIX_RE.search(raw_component)
        if not match:
            return None
        inside = match.group(1).strip()
        name_part = PAREN_SUFFIX_RE.sub("", raw_component).strip()
        return (
            node_id_to_node.get(inside)
            or node_name_to_node.get(inside)
            or node_id_to_node.get(name_part)
            or node_name_to_node.get(name_part)
        )

    @staticmethod
    def _build_node_lookup_maps(
        *, vertices: list[dict]
    ) -> tuple[dict[str, dict[str, str]], dict[str, dict[str, str]]]:
        node_id_to_node: dict[str, dict[str, str]] = {}
        node_name_to_node: dict[str, dict[str, str]] = {}
        for vertex in vertices:
            vid = vertex.get("id") or ""
            vname = vertex.get("name") or ""
            entry = {"id": vid, "name": vname}
            if vid:
                node_id_to_node[vid] = entry
            if vname:
                node_name_to_node[vname] = entry
        return node_id_to_node, node_name_to_node

    @staticmethod
    def _build_unavailable_quality_report(*, exc: Exception) -> dict[str, Any]:
        unavailable_report = {
            "summary": {
                "allPassed": False,
                "errors": 0,
                "warnings": 1,
                "issuesCount": 1,
                "unavailable": True,
            },
            "issues": [
                {
                    "severity": "warning",
                    "message": (
                        f"Quality pipeline failed ({exc.__class__.__name__}): {exc}"
                    ),
                }
            ],
            "paths": [],
        }
        return {
            "original": unavailable_report,
            "corrected": unavailable_report,
            "changes": [],
        }

    def _find_mitre_technique(self, *, technique_id: str):
        return next(
            (
                item
                for item in self.mitre_techniques
                if item.externalReferences
                and item.externalReferences[0].externalId == technique_id
            ),
            None,
        )

    def _build_attack_step(
        self,
        *,
        attack_step: dict[str, Any],
        step_index: int,
        node_id_to_node: dict[str, dict[str, str]],
        node_name_to_node: dict[str, dict[str, str]],
    ) -> dict[str, Any]:
        raw_component = attack_step.get("system_component", "")
        resolved_node = self._resolve_vertex(
            raw_component,
            node_id_to_node,
            node_name_to_node,
        )
        if resolved_node:
            resolved_name = resolved_node["name"]
        else:
            resolved_name = PAREN_SUFFIX_RE.sub("", raw_component).strip()

        new_attack_step: dict[str, Any] = {
            "techniqueId": attack_step.get("attack_id", ""),
            "technique": attack_step.get("attack_name", ""),
            "techniqueGenerated": attack_step.get("attack_name", ""),
            "techniqueValidated": False,
            "node": resolved_name,
            "nodeId": resolved_node["id"] if resolved_node else "",
            "step": step_index + 1,
        }

        technique = self._find_mitre_technique(
            technique_id=new_attack_step["techniqueId"]
        )
        technique_name = technique.name if technique else ""
        tactics = (
            self.get_tactics_from_kill_chain_phase(technique.killChainPhases)
            if technique
            else []
        )

        if not technique_name:
            new_attack_step["techniqueValidated"] = False
        elif technique_name != attack_step["attack_name"]:
            new_attack_step["techniqueValidated"] = True
        else:
            new_attack_step["technique"] = technique_name
            new_attack_step["techniqueValidated"] = True

        new_attack_step["tactics"] = tactics
        new_attack_step["icon"] = self.node_name_to_icon_mapping.get(
            new_attack_step["node"], ""
        )
        return new_attack_step

    def _build_scenario_from_path(
        self,
        *,
        path: dict[str, Any],
        node_id_to_node: dict[str, dict[str, str]],
        node_name_to_node: dict[str, dict[str, str]],
    ) -> dict[str, Any]:
        new_list_steps: list[dict[str, Any]] = []
        for step_index, attack_step in enumerate(path["attack_path"]):
            new_list_steps.append(
                self._build_attack_step(
                    attack_step=attack_step,
                    step_index=step_index,
                    node_id_to_node=node_id_to_node,
                    node_name_to_node=node_name_to_node,
                )
            )

        new_scenario: dict[str, Any] = {}
        if "risk_scenario" in path:
            new_scenario["risk_scenario"] = path["risk_scenario"]
        if "key_risk" in path:
            new_scenario["key_risk"] = path["key_risk"]
        new_scenario["attack_narrative"] = self._build_attack_narrative_fallback(
            path.get("attack_narrative"),
            new_list_steps,
            new_scenario.get("risk_scenario", ""),
        )

        attack_paths_obj: dict[str, Any] = {
            "pathId": f"path_{uuid.uuid4()}",
            "pathName": "path_001",
            "nodes": [],
            "edges": [],
            "steps": new_list_steps,
        }
        new_scenario["attack_paths"] = [attack_paths_obj]
        return new_scenario

    def _apply_quality_pipeline(
        self,
        *,
        scenario: dict[str, Any],
        quality_pipeline: "ThreatQualityPipelineProtocol",
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        try:
            pipeline_result = quality_pipeline.process(scenario)
            new_scenario = pipeline_result["scenario"]
            for corrected_path in new_scenario.get("attack_paths") or []:
                for corrected_step in corrected_path.get("steps") or []:
                    corrected_step["icon"] = self.node_name_to_icon_mapping.get(
                        corrected_step.get("node") or "", ""
                    )
            quality_report = pipeline_result["report"]
            return new_scenario, quality_report
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Quality pipeline failed for a scenario: %s", exc, exc_info=True
            )
            return scenario, self._build_unavailable_quality_report(exc=exc)

    @staticmethod
    def get_risk_scenario_object(
        new_path: dict,
        llm_name: str,
        gen_option_name: str,
        gen_option_prompt: list[str],
    ) -> dict:
        _id_source = f"{llm_name}|{gen_option_name}|{new_path.get('risk_scenario', '')}"
        new_id = f"LLM-{hashlib.sha256(_id_source.encode()).hexdigest()[:8]}"
        llm_risk_scenario = ProjectRiskScenario(
            riskScenarioId=new_id,
            sourceRiskScenarioId=new_id,
            knowledgebaseSource=KnowledgebaseSource.llm.value,
            category=llm_name,
            subcategory=gen_option_name,
            riskScenario=new_path.get("risk_scenario", "") or "",
            keyRisk=new_path.get("key_risk", "") or "",
            status="unresolved",
            attackNarrative=new_path.get("attack_narrative", {}) or {},
            attackPaths=new_path.get("attack_paths", []) or [],
            ref=new_path.get("ref", {}) or {},
            prompts=gen_option_prompt,
        )
        return llm_risk_scenario.model_dump()

    def __init__(
        self,
        configuration: "GeneratorConfiguration",
        prompts_dict: dict,
        project_input_model: "ProjectInputModelProtocol",
        mitre_parsed_docs: "MitreParsedDocs",
        project_register_updater: ProjectRegisterUpdater,
        project_id: str = "",
        task_context: "LlmTaskContext | None" = None,
        assessment_id: str = "",
        trusted_backend_context: bool = False,
        *,
        mongo_store: "LlmMongoStoreProtocol | None" = None,
    ):
        from shared_libs.models.llm_generator_context import LLMGeneratorContext

        logger.debug("[ RR-LLM ] Initialising LLM Risk Scenario Generator...")
        decision = LlmExecutionResolver.resolve_execution(
            requested_llm=configuration.llm,
            execution_mode=None,
            trusted_backend_context=trusted_backend_context,
        )
        _llm_thresholds = (
            PROGRESS_THRESHOLDS.get(AssessmentLifecycle.with_ai, {}).get("engine_llm")
            or {ProgressStage.path: 50, ProgressStage.llm: 90}
        )
        min_progress = _llm_thresholds[ProgressStage.path]
        max_progress = _llm_thresholds[ProgressStage.llm]

        super().__init__(
            context=LLMGeneratorContext(
                configuration=configuration,
                llm_key=configuration.llm,
                generator=LLMGenerationSingle(
                    prompts=LLMPromptBuilder(
                        configuration.role_label,
                        prompts_dict,
                        configuration.prompt,
                    ),
                ),
                progress=LLMGeneratorProgressContext(
                    track_progress=True,
                    min_progress=min_progress,
                    max_progress=max_progress,
                    project_register_updater=project_register_updater,
                ),
                runtime=LLMGeneratorRuntimeContext(
                    response_mode="json",
                    project_id=project_id,
                    task_context=task_context,
                    assessment_id=assessment_id,
                    decision=decision,
                    trusted_backend_context=trusted_backend_context,
                    mongo_store=mongo_store,
                ),
            ),
        )

        self.systemDescription = configuration.model_dump().get("systemDescription", "")
        self.gen_option_name = self._assert_gen_option_name(
            value=configuration.role_label
        )

        #
        self.project_input_model = project_input_model
        self.mitre_techniques = mitre_parsed_docs.technique or []
        self.mitre_tactics = mitre_parsed_docs.tactic or []

        #
        self.init_node_name_to_icon_mapping()

    @raise_exception(
        "Failed to init node name to icon mapping.",
        exception_logger=logger,
    )
    def init_node_name_to_icon_mapping(self) -> None:
        self.node_name_to_icon_mapping = {}
        vertices = self._read_dataflow_vertices(self.project_input_model)
        for obj in vertices:
            name = obj.get("name") or ""
            icon = obj.get("icon") or ""
            if name and icon:
                self.node_name_to_icon_mapping[name] = icon

    @raise_exception(
        "Failed to get tactics from kill chain phase.",
        exception_logger=logger,
    )
    def get_tactics_from_kill_chain_phase(
        self, killChainPhases: list["KillChainPhase"] | None
    ) -> list[str]:
        if not killChainPhases:
            return []

        phaseNames = [x.phaseName for x in killChainPhases]
        phaseLabels = [" ".join(x.split("-")).title() for x in phaseNames]

        result = []
        for label in phaseLabels:
            _id = next((i.mitreId for i in self.mitre_tactics if i.name == label), None)
            if _id:
                result.append(_id)

        return result

    @staticmethod
    def _coerce_narrative_list(value) -> list[str]:
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str) and value.strip():
            return [value.strip()]
        return []

    @classmethod
    def _build_attack_narrative_fallback(
        cls,
        narrative: dict | None,
        steps: list[dict],
        risk_scenario: str,
    ) -> dict:
        descriptions = cls._coerce_narrative_list(
            narrative.get("descriptions") if isinstance(narrative, dict) else []
        )
        techniques = cls._coerce_narrative_list(
            narrative.get("techniques") if isinstance(narrative, dict) else []
        )
        remarks = cls._coerce_narrative_list(
            narrative.get("remarks") if isinstance(narrative, dict) else []
        )

        if descriptions and techniques and remarks:
            return {
                "descriptions": descriptions,
                "techniques": techniques,
                "remarks": remarks,
            }

        fallback_descriptions = []
        for step in steps:
            node = step.get("node") or "the target component"
            technique_name = (
                step.get("technique")
                or step.get("techniqueGenerated")
                or step.get("techniqueId")
                or "an unknown technique"
            )
            technique_id = step.get("techniqueId") or ""
            if technique_id and technique_name != technique_id:
                fallback_descriptions.append(
                    f"The attacker targets {node} using {technique_id} {technique_name}."
                )
            else:
                fallback_descriptions.append(
                    f"The attacker targets {node} using {technique_name}."
                )

        fallback_techniques = []
        for step in steps:
            technique_name = (
                step.get("technique")
                or step.get("techniqueGenerated")
                or step.get("techniqueId")
                or ""
            )
            if technique_name and technique_name not in fallback_techniques:
                fallback_techniques.append(technique_name)

        fallback_remarks = []
        if risk_scenario:
            fallback_remarks.append(risk_scenario)
        fallback_remarks.append(
            "Narrative was reconstructed from the validated attack path steps."
        )

        return {
            "descriptions": descriptions or fallback_descriptions,
            "techniques": techniques or fallback_techniques,
            "remarks": remarks or fallback_remarks,
        }

    @raise_exception(
        "Failed to validate paths.",
        exception_logger=logger,
    )
    def validate_paths(
        self, generated_paths_json: dict[str, Any]
    ) -> list[dict[str, Any]]:
        result = []

        attack_paths = generated_paths_json["attack_paths"]
        if not attack_paths:
            logger.info("[ RR-LLM ] No attack paths from generated paths...")
            return result

        if not self.mitre_techniques:
            logger.info("[ RR-LLM ] No mitre parsed docs found...")
            return result

        vertices = self._read_dataflow_vertices(self.project_input_model)
        node_id_to_node, node_name_to_node = self._build_node_lookup_maps(
            vertices=vertices
        )

        quality_pipeline = ThreatQualityPipeline(
            mitre_techniques=self.mitre_techniques or [],
            vertices=vertices,
        )
        llm = self._assert_llm_initialized(llm=self.llm)
        scc_pipeline = ThreatSccCheckerPipeline(
            llm=llm,
            system_description=self.systemDescription,
        )

        scenario_total = len(attack_paths)
        if (
            self.llm_progress.track_progress
            and not MODULE_TEST
            and self.llm_progress.project_register_updater is not None
        ):
            self.llm_progress.project_register_updater.update_assessment_progress(
                self.llm_progress.max_progress or 0,
                progress_info="Generating security control recommendations.",
            )
        logger.info(
            "[ RR-LLM ] Quality+SCC check: %d scenario(s), "
            "recommendation + re-generation per scenario.",
            scenario_total,
        )

        for scenario_idx, path in enumerate(attack_paths, start=1):
            scc_report = scc_pipeline.process(
                path,
                scenario_index=scenario_idx,
                scenario_total=scenario_total,
            )
            new_scenario = self._build_scenario_from_path(
                path=scc_report.get("regeneratedScenario") or path,
                node_id_to_node=node_id_to_node,
                node_name_to_node=node_name_to_node,
            )
            new_scenario, quality_report = self._apply_quality_pipeline(
                scenario=new_scenario,
                quality_pipeline=quality_pipeline,
            )

            new_scenario["ref"] = {
                "quality": quality_report,
                "security_control": scc_report,
            }

            risk_scenario_object = self.get_risk_scenario_object(
                new_scenario,
                self.llm.name or "",
                self.gen_option_name,
                getattr(self.llm_generator, "gen_option_prompt", []),
            )

            result.append(risk_scenario_object)

        return result

    @raise_exception(
        "Failed to run llm risk scenario generator.",
        exception_logger=logger,
    )
    def generate(self) -> list[dict[str, Any]]:

        if self.systemDescription.startswith("data:image"):
            system_description_type = "image"
        else:
            system_description_type = "text"
        self.llm_generator.set_system(self.systemDescription, system_description_type)

        logger.debug("[ RR-LLM ] Generating paths...")

        result = self.generate_paths(
            schema=AttackPathStruc.schema,
            path_struc=AttackPathStruc.attack_path_struc,
            max_tries=3,
        )
        if not isinstance(result, dict):
            result = {"attack_paths": []}

        logger.info("[ RR-LLM ] Validating results...")
        validated_result = self.validate_paths(result)

        return validated_result
