import copy
import logging
import os
from typing import TYPE_CHECKING, Any

from engine_libs.config.framework_config import FRAMEWORK_DEF_KEYS, FRAMEWORK_ORDER
from engine_libs.config.llm_config import (
    COPY_OPTIONS_GROUP_FROM_FIELD_PRECONDITION_TYPE,
    FRAMEWORK_OPTION_ID_BY_SETTINGS_ATTR,
    LLM_ENABLED_FRAMEWORKS_FIELD_ID,
    LLM_VALUE_POLICY_SYS_DEFINED,
)
from engine_libs.lib.project_input_model_extractor import (
    ProjectInputModelExtractor,
)
from engine_libs.lib.system_description_extractor import SystemDescriptionExtractor
from engine_libs.utils.llm_threat_attributes_util import LLMThreatAttributesUtil

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import (
    KbLLMQuestionModel,
    KbLLMQuestionTemplateModel,
    PromptGenerationRuleCombineTemplateModel,
    PromptGenerationRuleModel,
    QuestionFieldOption,
)
from shared_libs.models.base_models.project import DisplayFrameworksSettings
from shared_libs.types.enum import LLMGenerationOption

if TYPE_CHECKING:
    from shared_libs.models.base_models.register import ProjectRegisterLLM
    from shared_libs.models.database_models import (
        KbAssessmentConfigModel,
        KbLLMPromptModel,
        ProjectRegisterModel,
    )

logger = logging.getLogger(__name__)


class LLMUtil:
    def __init__(
        self,
        project_register_model: "ProjectRegisterModel | None" = None,
        kb_llm_model: "KbLLMPromptModel | None" = None,
        kb_assessment_config_model: "KbAssessmentConfigModel | None" = None,
        question_to_model: dict[str, Any] | None = None,
        project_ad: dict[str, Any] | None = None,
        display_frameworks: "DisplayFrameworksSettings | None" = None,
    ):
        self.project_register_model = project_register_model
        self.kb_llm_model = kb_llm_model
        self.kb_assessment_config_model = kb_assessment_config_model
        self.project_llm_model: ProjectRegisterLLM | None = (
            project_register_model.llm if project_register_model else None
        )
        self.question_to_model = question_to_model
        self.project_ad = project_ad
        self.display_frameworks = display_frameworks or DisplayFrameworksSettings()
        self.allowed_llm_models = self._get_allowed_llm_models_from_env()

    @staticmethod
    def add_word_or_to_sentence(sentence):
        if ", " in sentence:
            last_comma = sentence.rfind(",")
            sentence = sentence[:last_comma] + ", or" + sentence[last_comma + 1 :]
        return sentence

    @staticmethod
    def _get_allowed_llm_models_from_env() -> set[str]:
        raw = os.environ.get("LLM_ALLOWED_MODELS", "")
        return {item.strip() for item in raw.split(",") if item.strip()}

    @staticmethod
    def _extract_canonical_model_key(option, known_model_keys: set[str]) -> str:
        tags = [tag for tag in (option.tags or []) if isinstance(tag, str) and tag]
        for tag in tags:
            if tag in known_model_keys:
                return tag
        return ""

    @staticmethod
    def _get_question_option_labels(question) -> dict[str, str]:
        option_labels: dict[str, str] = {}

        for option in question.field.options or []:
            option_id = option.optionId
            if option_id:
                option_labels[option_id] = option.label or ""

        for option_group in question.field.optionsGroup or []:
            for option in option_group.options or []:
                option_id = option.optionId
                if option_id:
                    option_labels[option_id] = option.label or ""

        return option_labels

    @staticmethod
    def _is_selectable_value_current(
        value: Any,
        option_labels: dict[str, str],
    ) -> bool:
        if not isinstance(value, dict):
            return True

        option_id = value.get("value")
        if not isinstance(option_id, str):
            return True

        if option_id not in option_labels:
            return False

        return value.get("label") == option_labels[option_id]

    @classmethod
    def _get_selectable_value_list(cls, question, value: Any) -> Any:
        if not cls._get_question_option_labels(question):
            return value
        if value in (None, ""):
            return []
        return value if isinstance(value, list) else [value]

    @classmethod
    def _repair_selectable_value(cls, question, value: Any) -> Any:
        option_labels = cls._get_question_option_labels(question)
        if not option_labels:
            return value

        current_values = cls._get_selectable_value_list(question, value)

        # Empty list means null/missing value for a selectable field and is always stale.
        # Vacuous truth (all([])) would incorrectly pass this through as valid.
        if not current_values:
            return cls._get_selectable_value_list(
                question,
                question.field.initialValue,
            )

        if all(
            cls._is_selectable_value_current(current_value, option_labels)
            for current_value in current_values
        ):
            # Return the original value in its original format (dict for radio, list
            # for multi-select) so the frontend can read .value directly.
            return value

        return cls._get_selectable_value_list(
            question,
            question.field.initialValue,
        )

    @raise_exception("Failed to run LLM util.", exception_logger=logger)
    def run(self):
        logger.info("[ RR-CORE ] Running llm utils...")
        self.project_llm_model.questions = [
            KbLLMQuestionModel(**question.model_dump())
            for question in (self.kb_assessment_config_model.ai.questions or [])
        ]
        self.project_llm_model.schema_ = self.kb_llm_model.schema_
        self.set_question_template_prompt()
        self.set_dependent_fields()
        self.set_question_template_system_description()
        self.populate_stage_llm_model_options()
        self.set_initial_values()
        self.set_values()
        self.update_category_options()
        self.apply_system_defined_field_state()
        self.check_if_options_disabled_from_env()

    @raise_exception(
        "Failed to apply system-defined field state.",
        exception_logger=logger,
    )
    def apply_system_defined_field_state(self):
        for question in self.project_llm_model.questions:
            if not question.properties or not question.field:
                continue
            if question.properties.valuePolicy == LLM_VALUE_POLICY_SYS_DEFINED:
                question.field.disabled = True

    def _get_options_group_copy_preconditions(self, question):
        return [
            precondition
            for precondition in question.preConditions
            if precondition.type == COPY_OPTIONS_GROUP_FROM_FIELD_PRECONDITION_TYPE
        ]

    def _get_model_option_questions(self):
        field_ids = set()
        for question in self.project_llm_model.questions:
            for precondition in self._get_options_group_copy_preconditions(question):
                field_ids.add(question.fieldId)
                field_ids.add(precondition.properties.fieldIdRef)
        return [
            question
            for question in self.project_llm_model.questions
            if question.fieldId in field_ids or self._has_default_options(question)
        ]

    def populate_stage_llm_model_options(self):
        """Copy grouped options into questions configured with a source field."""
        default_options = self.kb_assessment_config_model.ai.defaultOptions or {}
        default_options_group = (
            self.kb_assessment_config_model.ai.defaultOptionsGroup or {}
        )
        for question in self.project_llm_model.questions:
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

        question_by_field_id = {
            question.fieldId: question for question in self.project_llm_model.questions
        }
        for question in self.project_llm_model.questions:
            for precondition in self._get_options_group_copy_preconditions(question):
                source_question = question_by_field_id.get(
                    precondition.properties.fieldIdRef
                )
                if source_question is None:
                    continue
                question.field.optionsGroup = copy.deepcopy(
                    source_question.field.optionsGroup
                )

    def _has_default_options_group(self, question) -> bool:
        default_options_group_key = (
            question.properties.defaultOptionsGroupKey or ""
        ).strip()
        return bool(default_options_group_key) and default_options_group_key in (
            self.kb_assessment_config_model.ai.defaultOptionsGroup or {}
        )

    def _has_default_options(self, question) -> bool:
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

    @raise_exception(
        "Failed to update questions in kb llm model.", exception_logger=logger
    )
    def set_question_template_prompt(self):
        updated_questions = []
        for question in self.project_llm_model.questions:
            if question.field.type == "prompt":
                gen_rule = next(
                    (
                        r
                        for r in self.kb_llm_model.prompt_generation_rules
                        if r.fieldId == question.fieldId
                    ),
                    {},
                )
                question.template = self.get_prompt_template(gen_rule)
            updated_questions.append(question)
        self.project_llm_model.questions = updated_questions

    @raise_exception(
        "Failed to update dependent fields in kb llm model.",
        exception_logger=logger,
    )
    def set_dependent_fields(self):
        dependent_fields = {}
        for question in self.project_llm_model.questions:
            if len(question.preConditions):
                for preCon in question.preConditions:
                    if preCon.type != "checkIsDisabledFromUserInput":
                        continue
                    dependent_fields[question.fieldId] = {
                        "fieldIdRef": preCon.properties.fieldIdRef,
                        "optionIds": preCon.properties.optionIds,
                    }
        self.project_llm_model.dependentFields = dependent_fields

    @raise_exception(
        "Failed to set initial values for kb llm.", exception_logger=logger
    )
    def set_initial_values(self):
        initial_values = {}
        for question in self.project_llm_model.questions:
            if question.field.type == "image":
                options = []
                for refValue in self.project_llm_model.refValues:
                    options.append(
                        QuestionFieldOption(
                            label=refValue.label,
                            optionId=refValue.imageUrl,
                            ref={**refValue.model_dump()},
                        )
                    )
                question.field.options = options
            initial_values[question.fieldId] = self._get_selectable_value_list(
                question,
                question.field.initialValue,
            )
        self.project_llm_model.initialValues = initial_values

    @raise_exception("Failed to set values for kb llm.", exception_logger=logger)
    def set_values(self):
        existing_values = dict(self.project_llm_model.values or {})
        values = {}
        for question in self.project_llm_model.questions:
            generated_value = question.field.initialValue
            field_id = question.fieldId
            if question.field.type == "text":
                generated_value = question.template
            elif question.field.type == "radio":
                if not len(question.field.options):
                    generated_value = question.field.initialValue
                else:
                    _option = question.field.options[0]
                    generated_value = {
                        "label": _option.label,
                        "value": _option.optionId,
                    }
            elif field_id == LLM_ENABLED_FRAMEWORKS_FIELD_ID:
                generated_value = self._build_enabled_framework_options()
            elif question.field.type == "prompt":
                generated_value = question.template
            elif question.field.type == "image":
                generated_value = ""

            is_system_defined = (
                bool(question.properties)
                and question.properties.valuePolicy == LLM_VALUE_POLICY_SYS_DEFINED
            )
            if is_system_defined:
                values[field_id] = self._get_selectable_value_list(
                    question,
                    generated_value,
                )
                continue

            if field_id in existing_values:
                values[field_id] = self._repair_selectable_value(
                    question,
                    existing_values[field_id],
                )
            else:
                values[field_id] = self._get_selectable_value_list(
                    question,
                    generated_value,
                )
        self.project_llm_model.values = values

    def _build_enabled_framework_options(self) -> list[dict]:
        enabled = []
        for settings_attr, label, _instr, _json_key, _def_suffix in FRAMEWORK_ORDER:
            if getattr(self.display_frameworks, settings_attr, False):
                option_id = FRAMEWORK_OPTION_ID_BY_SETTINGS_ATTR.get(settings_attr)
                if option_id:
                    enabled.append({"label": label, "value": option_id})
        return enabled

    @raise_exception("Failed to get prompt template.", exception_logger=logger)
    def get_prompt_template(self, gen_rule_model: "PromptGenerationRuleModel"):
        from engine_libs.struc import (
            AttackPathStruc,
            LLMReturnStructDataflow,
            LLMReturnStructDiagram,
        )

        enabled = LLMThreatAttributesUtil.get_enabled_frameworks(
            self.display_frameworks
        )
        # {result_struc} is reused verbatim across several prompt templates, so
        # the threat-generation prompts must be redirected to the attack-path
        # schema — otherwise they inherit the attributes schema and ask the LLM
        # for impact/likelihood/category up front (the information is only meant
        # to be produced by the final attributes stage). The attributes prompt
        # keeps the attributes schema, which is what the default is for.
        option = gen_rule_model.generationOption
        if option in (
            LLMGenerationOption.single.value,
            LLMGenerationOption.chain.value,
        ):
            result_struc = AttackPathStruc.attack_path_struc
        elif option == LLMGenerationOption.dataflow.value:
            result_struc = LLMReturnStructDataflow.dataflow_struc
        elif (
            option == LLMGenerationOption.architecture.value
            or option == LLMGenerationOption.diagram.value
        ):
            result_struc = LLMReturnStructDiagram.diagram_struc
        else:
            result_struc = LLMThreatAttributesUtil.build_result_struc(enabled)
        framework_substitutions = {
            "{frameworks_intro_list}": LLMThreatAttributesUtil.build_intro_list(
                enabled
            ),
            "{frameworks_instructions_list}": LLMThreatAttributesUtil.build_instructions_list(
                enabled
            ),
            "{result_struc}": result_struc,
        }

        prompt: list[list[KbLLMQuestionTemplateModel]] = []
        for phase in gen_rule_model.format:
            phase_array: list[KbLLMQuestionTemplateModel] = []
            for key in phase.template:
                framework_attr = FRAMEWORK_DEF_KEYS.get(key)
                if framework_attr and not getattr(
                    self.display_frameworks, framework_attr, False
                ):
                    continue

                temp_line = ""
                if key in self.kb_llm_model.prompt_template_lines.keys():
                    temp_line = self.kb_llm_model.prompt_template_lines[key]
                else:
                    combined_template_model = next(
                        (r for r in phase.combineTemplate if r.template == key),
                        None,
                    )
                    if combined_template_model:
                        temp_line = self.combine_template_lines(combined_template_model)

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
                phase_array.append(KbLLMQuestionTemplateModel(**template))
            prompt.append(phase_array)
        return prompt

    @raise_exception("Failed to combine template lines.", exception_logger=logger)
    def combine_template_lines(
        self,
        combined_template_model: "PromptGenerationRuleCombineTemplateModel",
    ):
        template_lines = [
            self.kb_llm_model.prompt_template_lines[key]
            for key in combined_template_model.toCombine
        ]
        if len(template_lines) == 2:
            return (" ").join(template_lines) + "."
        if len(template_lines) > 2:
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
        return ""

    @raise_exception(
        "Failed to get project model in llm utils.",
        exception_logger=logger,
    )
    def get_project_input_model(self) -> None:
        self.project_input_model_extractor = ProjectInputModelExtractor(
            question_to_model=self.question_to_model,
            project_ad=self.project_ad,
        )
        project_input_model = (
            self.project_input_model_extractor.get_project_input_model()
        )
        return project_input_model.project_input_model_dict

    @raise_exception(
        "Failed to get system description in llm utils.",
        exception_logger=logger,
    )
    def set_question_template_system_description(self):
        logger.info("[ RR-CORE ] Setting question template system description ...")
        project_input_model = self.get_project_input_model()
        sys_desc = SystemDescriptionExtractor(project_input_model)
        complete_sys_desc = sys_desc.get_complete_system_description()

        updated_questions = []
        for question in self.project_llm_model.questions:
            if question.field.type == "text":
                question.template = complete_sys_desc
            elif question.field.type == "image":
                question.template = ""
            updated_questions.append(question)
        self.project_llm_model.questions = updated_questions

    @raise_exception("Failed to update category options.", exception_logger=logger)
    def update_category_options(self):
        category_options = self.project_register_model.legacy.category_options or []
        _category_options = category_options + ["Llama", "Gemini", "OpenAI"]
        subcategory_options = (
            self.project_register_model.legacy.subcategory_options or {}
        )
        _sub_category_options = {
            **subcategory_options,
            "Llama": ["Single Prompt", "Chain Prompt"],
            "Gemini": ["Single Prompt", "Chain Prompt"],
            "OpenAI": ["Single Prompt", "Chain Prompt"],
        }
        self.project_register_model.legacy.category_options = list(
            set(_category_options)
        )
        self.project_register_model.legacy.subcategory_options = _sub_category_options

    @raise_exception(
        "Failed to check if options are disabled from env.",
        exception_logger=logger,
    )
    def check_if_options_disabled_from_env(self):
        known_model_keys = set(self.allowed_llm_models)

        def _is_allowed(option) -> bool:
            canonical_model_key = self._extract_canonical_model_key(
                option, known_model_keys
            )
            return bool(
                canonical_model_key and canonical_model_key in self.allowed_llm_models
            )

        for question in self._get_model_option_questions():
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
