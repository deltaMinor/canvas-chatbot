import copy
import logging
import os
from typing import TYPE_CHECKING

from engine_libs.config.framework_config import FRAMEWORK_DEF_KEYS, FRAMEWORK_ORDER
from engine_libs.lib.project_input_model_extractor.project_input_model_extractor import (
    ProjectInputModelExtractor,
)
from engine_libs.lib.system_description_extractor.system_description_extractor import (
    SystemDescriptionExtractor,
)
from engine_libs.llm_runtime.config import get_model_execution_modes
from engine_libs.utils.llm_threat_attributes_util import LLMThreatAttributesUtil

from shared_libs.constants.llm_field import (
    LLM_ENABLED_FRAMEWORKS_FIELD_ID,
    LLM_MODEL_FIELD_ID,
    LLM_VALUE_POLICY_SYS_DEFINED,
)
from shared_libs.decorators.raise_exception import raise_exception
from shared_libs.models.base_models import (
    KbLLMQuestionTemplateModel,
    PromptGenerationRuleCombineTemplateModel,
    PromptGenerationRuleModel,
    QuestionFieldOption,
)
from shared_libs.models.base_models.project import DisplayFrameworksSettings
from shared_libs.models.base_models.register import (
    AssessmentConfig,
    AssessmentConfigObject,
)
from shared_libs.models.base_models.shared.llm import (
    KbLLMQuestionModel,
    ProjectLLMRefValues,
)
from shared_libs.models.base_models.shared.shared.question import (
    QuestionFieldOptionsGroup,
)
from shared_libs.models.database_models import (
    KbAssessmentConfigModel,
    KbLLMPromptModel,
    ProjectADModel,
)

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


class AssessmentConfigGenerator:
    def __init__(
        self,
        kb_assessment_config_model: "KbAssessmentConfigModel" = None,
        kb_llm_prompt_model: "KbLLMPromptModel" = None,
        question_to_model=None,
        project_cq=None,
        project_ad=None,
        display_frameworks: "DisplayFrameworksSettings | None" = None,
    ):
        self.project_cq = project_cq
        self.project_ad = project_ad
        self.display_frameworks = display_frameworks or DisplayFrameworksSettings()

        #
        self.kb_assessment_config_model = kb_assessment_config_model
        self.kb_llm_prompt_model = kb_llm_prompt_model
        self.question_to_model = question_to_model
        self.allowed_llm_models = self._get_allowed_llm_models_from_env()

        #
        self.configuration = AssessmentConfig()

    @raise_exception(
        "Failed to run LLM util.",
        exception_logger=logger,
    )
    def run(self) -> None:
        self.configuration = AssessmentConfig(
            main=self._get_assessment_config("main"),
            ai=self._get_assessment_config("ai"),
            pentest=self._get_assessment_config("pentest"),
            graph_reasoning=self._get_assessment_config("graph_reasoning"),
        )

    @raise_exception("Failed to process llm configuration.", exception_logger=logger)
    def _get_assessment_config(self, config_type: str) -> None:
        logger.info("[ RR-CORE ] Processing llm configuration for run assessment...")

        if config_type == "main":
            kb_questions = [
                _.model_dump()
                for _ in self.kb_assessment_config_model.get_section_config(
                    "main_engine"
                ).questions
            ]
        if config_type == "ai":
            kb_questions = self._get_ai_questions()
        if config_type == "pentest":
            kb_questions = [
                _.model_dump()
                for _ in self.kb_assessment_config_model.pentest.questions
            ]
        if config_type == "graph_reasoning":
            kb_questions = [
                _.model_dump()
                for _ in self.kb_assessment_config_model.graph_reasoning.questions
            ]

        kb_questions_model = [KbLLMQuestionModel(**_) for _ in kb_questions]

        questions = self._get_questions(kb_questions_model, config_type)
        return AssessmentConfigObject(
            questions=questions,
            dependentFields=self._get_dependent_fields(questions),
            values=self._get_values(questions, []),
        )

    # =====================================================
    # Getters
    # =====================================================
    def _get_ai_questions(self) -> list[dict]:
        return [
            question.model_dump()
            for question in self.kb_assessment_config_model.ai.questions
        ]

    @raise_exception("Failed to get questions.", exception_logger=logger)
    def _get_questions(
        self, questions: list["KbLLMQuestionModel"], type: str
    ) -> list["KbLLMQuestionModel"]:
        # prompt
        self._update_question_template_field(questions)
        # system description
        self._update_question_template_system_desc(questions)

        self._apply_system_defined_field_state(questions)
        if type == "pentest":
            # get options from ad for pentest
            self._update_question_options_from_ad(questions)
        if type == "ai":
            self._set_default_question_options_groups(questions)
            self._append_execution_mode_tags_to_llm_options(questions)
            self._check_if_options_disabled_from_env(questions)
            self._copy_question_options_from_referenced_fields(questions)

        return questions

    @raise_exception(
        "Failed to apply system-defined field state.",
        exception_logger=logger,
    )
    def _apply_system_defined_field_state(
        self, questions: list["KbLLMQuestionModel"]
    ) -> list["KbLLMQuestionModel"]:
        for question in questions:
            if not question.properties or not question.field:
                continue
            if question.properties.valuePolicy == LLM_VALUE_POLICY_SYS_DEFINED:
                question.field.disabled = True

    def _update_question_options_from_ad(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        for question in questions:
            if len(question.preConditions):
                for preCon in question.preConditions:
                    if preCon.type == "getOptionsFromArchitectureDiagramNodes":
                        project_ad_model = ProjectADModel(**self.project_ad)
                        all_nodes = [
                            n for c in project_ad_model.canvas for n in c.nodes
                        ]
                        for n in all_nodes:
                            if (
                                n.type == "infoNode" and "cardRefKey" not in n.data
                            ) or (
                                n.type == "clusterNode"
                                and n.data.get("cardRefKey", "") == "card_devices"
                            ):
                                tags = []
                                if "ip_address" in n.data:
                                    tags.append(n.data["ip_address"])
                                option = QuestionFieldOption(
                                    label=n.data["label"], optionId=n.id, tags=tags
                                )
                                question.field.options.append(option)

    @raise_exception(
        "Failed to update dependent fields in assessment config.",
        exception_logger=logger,
    )
    def _get_dependent_fields(self, questions: list["KbLLMQuestionModel"]) -> dict:
        dependent_fields = {}
        for question in questions:
            preConditions = [
                preCondition
                for preCondition in question.preConditions
                if preCondition.type == "checkIsDisabledFromUserInput"
            ]
            if preConditions:
                dependent_fields[question.fieldId] = {
                    "fieldIdRef": preConditions[0].properties.fieldIdRef,
                    "optionIds": preConditions[0].properties.optionIds,
                }
        return dependent_fields

    @raise_exception(
        "Failed to set values for assessment config.",
        exception_logger=logger,
    )
    def _get_values(
        self,
        questions: list["KbLLMQuestionModel"],
        refValues: list["ProjectLLMRefValues"],
    ) -> dict:
        values = {}
        for question in questions:
            fieldId = question.fieldId
            if question.field.type == "text":
                values[fieldId] = question.template
            elif question.field.type == "radio":
                if not len(question.field.options):
                    continue
                if fieldId == LLM_MODEL_FIELD_ID:
                    # LLM model must be explicitly selected by the user.
                    values[fieldId] = {}
                else:
                    initialValue: dict = question.field.initialValue
                    values[fieldId] = initialValue
            elif question.field.type == "selectMulti":
                if fieldId == LLM_ENABLED_FRAMEWORKS_FIELD_ID:
                    values[fieldId] = self._build_enabled_framework_options(question)
                else:
                    values[fieldId] = []
            elif question.field.type == "selectGroup":
                values[fieldId] = question.field.initialValue or {}
            elif question.field.type == "prompt":
                values[fieldId] = question.template
            elif question.field.type == "image":
                options = []
                for refValue in refValues:
                    options.append(
                        QuestionFieldOption(
                            label=refValue.label,
                            optionId=refValue.imageUrl,
                            ref={**refValue.model_dump()},
                        )
                    )
                question.field.options = options
                values[fieldId] = ""
            else:
                values[fieldId] = ""
        return values

    # =====================================================
    # Utiltiy
    # =====================================================
    @raise_exception(
        "Failed to update questions in assessment config.",
        exception_logger=logger,
    )
    def _update_question_template_field(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        for question in questions:
            if question.field.type == "prompt":
                gen_rule = next(
                    (
                        r
                        for r in self.kb_llm_prompt_model.prompt_generation_rules
                        if r.fieldId == question.fieldId
                    ),
                    None,
                )
                if not gen_rule:
                    print(f"OMG CANNOT FIND GEN RULE FOR {question.fieldId}")
                question.template = self._prompt_get_template(gen_rule)

    @raise_exception(
        "Failed to get system description in llm utils.",
        exception_logger=logger,
    )
    def _update_question_template_system_desc(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        project_input_model = self._get_project_input_model()

        sys_desc = SystemDescriptionExtractor(project_input_model)
        complete_sys_desc = sys_desc.get_complete_system_description()

        for question in questions:
            # text
            if question.field.type == "text":
                question.template = complete_sys_desc
            # image
            elif question.field.type == "image":
                question.template = ""

    @raise_exception(
        "Failed to get project model in llm utils.",
        exception_logger=logger,
    )
    def _get_project_input_model(self) -> None:
        if hasattr(self, "_project_input_model_cache"):
            return self._project_input_model_cache
        self.project_input_model_extractor = ProjectInputModelExtractor(
            question_to_model=self.question_to_model,
            project_cq=self.project_cq,
            project_ad=self.project_ad,
        )
        project_input_model = (
            self.project_input_model_extractor.get_project_input_model()
        )
        self._project_input_model_cache = project_input_model.project_input_model_dict
        return self._project_input_model_cache

    @raise_exception(
        "Failed to check if options are allowed from env.",
        exception_logger=logger,
    )
    def _get_allowed_llm_models_from_env(self) -> set[str]:
        raw = os.environ.get("LLM_ALLOWED_MODELS", "")
        return {item.strip() for item in raw.split(",") if item.strip()}

    # =====================================================
    # Prompt Utility
    # =====================================================
    def _build_enabled_framework_options(
        self, question: "KbLLMQuestionModel"
    ) -> list[dict]:
        options_by_settings_attr = {
            settings_attr: option
            for (settings_attr, *_), option in zip(
                FRAMEWORK_ORDER,
                question.field.options,
                strict=False,
            )
        }
        enabled = []
        for settings_attr, _label, _instr, _json_key, _def_suffix in FRAMEWORK_ORDER:
            if getattr(self.display_frameworks, settings_attr, False):
                option = options_by_settings_attr.get(settings_attr)
                if option and option.optionId:
                    enabled.append({"label": option.label, "value": option.optionId})
        return enabled

    @raise_exception(
        "Failed to get prompt template.",
        exception_logger=logger,
    )
    def _prompt_get_template(
        self,
        gen_rule_model: "PromptGenerationRuleModel",
    ):
        enabled = LLMThreatAttributesUtil.get_enabled_frameworks(
            self.display_frameworks
        )
        framework_substitutions = {
            "{frameworks_intro_list}": LLMThreatAttributesUtil.build_intro_list(
                enabled
            ),
            "{frameworks_instructions_list}": LLMThreatAttributesUtil.build_instructions_list(
                enabled
            ),
            "{result_struc}": LLMThreatAttributesUtil.build_result_struc(enabled),
        }

        prompt: list[list[KbLLMQuestionTemplateModel]] = []
        for phase in gen_rule_model.format:
            phase_array: list[KbLLMQuestionTemplateModel] = []
            for key in phase.template:
                # Skip framework def blocks whose toggle is off.
                framework_attr = FRAMEWORK_DEF_KEYS.get(key)
                if framework_attr and not getattr(
                    self.display_frameworks, framework_attr, False
                ):
                    continue

                temp_line = ""
                if key in self.kb_llm_prompt_model.prompt_template_lines.keys():
                    temp_line = self.kb_llm_prompt_model.prompt_template_lines[key]
                else:
                    combined_template_model = next(
                        (r for r in phase.combineTemplate if r.template == key),
                        None,
                    )
                    if combined_template_model:
                        temp_line = self._prompt_combine_template_lines(
                            combined_template_model
                        )

                for placeholder, value in framework_substitutions.items():
                    if placeholder in temp_line:
                        temp_line = temp_line.replace(placeholder, value)

                user_editable = key in phase.userEditable

                hidden_keys = ["input_role", "input_system_description"]

                template = {
                    "key": key,
                    "line": temp_line,
                    "userEditable": user_editable,
                    "userInput": temp_line,
                    "isHidden": key in hidden_keys,
                }
                template_model = KbLLMQuestionTemplateModel(**template)
                phase_array.append(template_model)
            prompt.append(phase_array)
        return prompt

    @raise_exception(
        "Failed to combine template lines.",
        exception_logger=logger,
    )
    def _prompt_combine_template_lines(
        self,
        combined_template_model: "PromptGenerationRuleCombineTemplateModel",
    ):
        template_lines = [
            self.kb_llm_prompt_model.prompt_template_lines[key]
            for key in combined_template_model.toCombine
        ]
        if len(template_lines) == 2:
            return (" ").join(template_lines) + "."
        elif len(template_lines) > 2:
            first_line = template_lines.pop(0)
            last_line = template_lines.pop()
            return (
                first_line
                + (", ").join(template_lines)
                + ", "
                + combined_template_model.operator
                + " "
                + last_line
                + "."
            )
        else:
            return ""

    @raise_exception(
        "Failed to check if options are disabled from env.",
        exception_logger=logger,
    )
    def _check_if_options_disabled_from_env(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        known_model_keys = set(self.allowed_llm_models) | set(
            self._get_execution_mode_by_model_key().keys()
        )

        def _is_allowed(option) -> bool:
            canonical_model_key = self._extract_canonical_model_key(
                option, known_model_keys
            )
            return bool(
                canonical_model_key and canonical_model_key in self.allowed_llm_models
            )

        for question in questions:
            if not self._has_default_options(question):
                continue
            question.field.options = [
                option for option in question.field.options if _is_allowed(option)
            ]
            if question.field.optionsGroup:
                for group in question.field.optionsGroup:
                    group.options = [
                        option
                        for option in (group.options or [])
                        if _is_allowed(option)
                    ]

    @raise_exception(
        "Failed to set default question options groups.",
        exception_logger=logger,
    )
    def _set_default_question_options_groups(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        default_options = self.kb_assessment_config_model.ai.defaultOptions or {}
        default_options_group = (
            self.kb_assessment_config_model.ai.defaultOptionsGroup or {}
        )
        for question in questions:
            default_options_key = (question.properties.defaultOptionsKey or "").strip()
            default_options_group_key = (
                question.properties.defaultOptionsGroupKey or ""
            ).strip()
            if default_options_key and default_options_key in default_options:
                question.field.options = copy.deepcopy(
                    default_options[default_options_key]
                )
            if (
                not default_options_group_key
                or default_options_group_key not in default_options_group
            ):
                continue

            question.field.optionsGroup = copy.deepcopy(
                default_options_group[default_options_group_key]
            )

    @raise_exception(
        "Failed to copy referenced question options.",
        exception_logger=logger,
    )
    def _copy_question_options_from_referenced_fields(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        question_by_field_id = {question.fieldId: question for question in questions}
        for question in questions:
            for pre_condition in question.preConditions:
                if pre_condition.type != "copyOptionsGroupFromField":
                    continue

                source_question = question_by_field_id.get(
                    pre_condition.properties.fieldIdRef
                )
                if not source_question or not source_question.field:
                    continue

                question.field.options = list(source_question.field.options or [])
                question.field.optionsGroup = list(
                    source_question.field.optionsGroup or []
                )

    @raise_exception(
        "Failed to append execution mode tags to llm options.",
        exception_logger=logger,
    )
    def _append_execution_mode_tags_to_llm_options(
        self, questions: list["KbLLMQuestionModel"]
    ) -> None:
        execution_mode_by_model_key = self._get_execution_mode_by_model_key()
        known_model_keys = set(execution_mode_by_model_key.keys())
        for question in questions:
            if not self._has_default_options(question):
                continue

            option_collections: QuestionFieldOptionsGroup = [
                question.field.options or []
            ]
            option_collections.extend(
                (group.options or []) for group in (question.field.optionsGroup or [])
            )

            for options in option_collections:
                for option in options:
                    existing_tags = [
                        tag
                        for tag in (option.tags or [])
                        if isinstance(tag, str) and tag
                    ]
                    canonical_model_key = self._extract_canonical_model_key(
                        option, known_model_keys
                    )
                    if not canonical_model_key:
                        option.tags = existing_tags
                        continue
                    execution_mode = execution_mode_by_model_key.get(
                        canonical_model_key
                    )
                    next_tags = [*existing_tags]
                    if canonical_model_key not in next_tags:
                        next_tags.append(canonical_model_key)
                    if execution_mode and execution_mode not in next_tags:
                        next_tags.append(execution_mode)
                    option.tags = next_tags

    @staticmethod
    def _get_execution_mode_by_model_key() -> dict[str, str]:
        return {k: v.value for k, v in get_model_execution_modes().items()}

    def _has_default_options_group(self, question: "KbLLMQuestionModel") -> bool:
        default_options_group_key = (
            question.properties.defaultOptionsGroupKey or ""
        ).strip()
        return bool(default_options_group_key) and default_options_group_key in (
            self.kb_assessment_config_model.ai.defaultOptionsGroup or {}
        )

    def _has_default_options(self, question: "KbLLMQuestionModel") -> bool:
        default_options_key = (question.properties.defaultOptionsKey or "").strip()
        default_options_group_key = (
            question.properties.defaultOptionsGroupKey or ""
        ).strip()
        return (
            bool(default_options_key)
            and default_options_key
            in (self.kb_assessment_config_model.ai.defaultOptions or {})
        ) or (
            bool(default_options_group_key)
            and default_options_group_key
            in (self.kb_assessment_config_model.ai.defaultOptionsGroup or {})
        )

    @staticmethod
    def _extract_canonical_model_key(
        option: QuestionFieldOption, known_model_keys: set[str]
    ) -> str:
        canonical_name = str(option.canonicalName or "").strip()
        if canonical_name:
            return canonical_name
        tags = [tag for tag in (option.tags or []) if isinstance(tag, str) and tag]
        for tag in tags:
            if tag in known_model_keys:
                return tag
        return ""
