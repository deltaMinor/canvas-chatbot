import logging
import uuid
from collections.abc import Callable
from datetime import date, datetime
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel

from shared_libs.lib.admin_flag_resolver import derive_is_admin
from shared_libs.lib.diagram_util.canvas_node_sorter import CanvasNodeSorter
from shared_libs.lib.prompt_role import prompt_role_label
from shared_libs.lib.prompt_type import canonical_prompt_type
from shared_libs.models.model_batch_helper import ModelBatchHelper
from shared_libs.types.enum import (
    CanvasNodeVariantType,
    ScenarioTags,
)

if TYPE_CHECKING:
    from shared_libs.models.base_models.shared.shared.database import PatchBaseModel

logger = logging.getLogger(__name__)


class AbstractValidator:
    patchVer_ = ""

    @staticmethod
    def normalize_data(data: Any) -> Any:
        """Coerce *data* to a plain ``dict``.

        The canonical input shape is ``dict``.  Any other type is a legacy
        caller shape — a warning is emitted so the root cause can be found
        and corrected upstream.
        """
        if isinstance(data, dict):
            return data
        if data is None:
            logger.warning(
                "AbstractValidator.normalize_data: received None instead of dict."
                " Caller should pass an explicit empty dict {}.",
            )
            return {}
        if isinstance(data, BaseModel):
            logger.warning(
                "AbstractValidator.normalize_data: received BaseModel %s instead of"
                " dict. Caller should call .model_dump() before passing.",
                type(data).__name__,
            )
            return data.model_dump()
        logger.warning(
            "AbstractValidator.normalize_data: unexpected type %s — returning as-is.",
            type(data).__name__,
        )
        return data

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class MitigationMeasureValidator(AbstractValidator):
    patchVer_ = "patch_40ac6c54-97cf-4e7d-a092-6b6e25c35177"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "id" in data:
            data["mitigationId"] = data["id"]
            _patchkeys.append("mitigationId")

        # ==============================
        if "location" in data and isinstance(data["location"], list):
            new_location = [
                obj if isinstance(obj, dict) else {"id": "", "label": obj}
                for obj in data["location"]
                if isinstance(obj, (str, dict))
            ]
            data["location"] = new_location
            _patchkeys.append("location")

        # ==============================
        if "assignee" in data:
            assignee = data["assignee"]
            if isinstance(assignee, list):
                data["assignees"] = data.get("assignees", []) + assignee
            elif isinstance(assignee, str):
                # Wrap the single string as a one-element list.  Previously the
                # code did `[_ for _ in assignee]` which iterated the string
                # character-by-character — "john" → ["j","o","h","n"].
                logger.warning(
                    "MitigationMeasureValidator: 'assignee' is a str '%s' — "
                    "expected list[str].  Wrapping in a list; caller should send a list.",
                    assignee,
                )
                data["assignees"] = data.get("assignees", []) + [assignee]
            _patchkeys.append("assignees")

        # ==============================
        if "assignees" in data:
            _assignees = [_ for _ in data["assignees"] if _]
            if len(_assignees) != len(data["assignees"]):
                data["assignees"] = _assignees
                _patchkeys.append("assignees")

        # ==============================
        if "kb_associations" in data:
            data["kbAssociations"] = data["kb_associations"]
            _patchkeys.append("kbAssociations")

        # ==============================
        if "measure_format" in data:
            data["measureFormat"] = data["measure_format"]
            _patchkeys.append("measure_format")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectBaseValidator(AbstractValidator):
    patchVer_ = "patch_3c256f26-487a-4d1c-8f34-39c3e8a4361e"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "project_status" in data and isinstance(data["project_status"], dict):
            data["project_progress"] = data["project_status"]
            _patchkeys.append("project_progress")
            data["project_status"] = data.get("project_activity", "active")
            _patchkeys.append("project_status")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class AuditLogValidator(AbstractValidator):
    patchVer_ = "patch_6598c14b-8651-4ebe-b538-eb6fadffc774"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "logId" not in data:
            data["logId"] = f"log_{uuid.uuid4()}"
            _patchkeys.append("logId")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class LLMConfigurationValidator(AbstractValidator):
    patchVer_ = "patch_3e7f9b24-c851-4d6a-a042-f08b1c5e9d7a"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        # Coerce scalar option fields: {label, value} dict or [{label, value}] → str
        if "generationOption" in data and "prompt_type" not in data:
            data["prompt_type"] = data["generationOption"]
            _patchkeys.append("prompt_type")

        # Legacy configurations used "role"; runtime generators consume role_label.
        if "role" in data and "role_label" not in data:
            data["role_label"] = data.pop("role")
            _patchkeys.append("role_label")

        if "prompt_type" in data:
            data["prompt_type"] = canonical_prompt_type(data.get("prompt_type"))
            _patchkeys.append("prompt_type")

        for key in (
            "applyLlmModelToAllStages",
            "llmModelSingle",
            "role_label",
        ):
            val = data.get(key)
            if key == "role_label":
                next_role = _prompt_role_label_from_value(val)
                if next_role != data.get(key):
                    data[key] = next_role
                    _patchkeys.append(key)
                continue
            if isinstance(val, list):
                val = val[0] if val else None
            if isinstance(val, dict):
                next_value = val.get("canonicalName") or val.get("value") or ""
                if isinstance(next_value, str) and next_value.startswith("option_"):
                    next_value = ""
                data[key] = next_value
                _patchkeys.append(key)

        # ==============================
        # Coerce enabledFrameworks: list[{label, value}] → list[str]
        frameworks = data.get("enabledFrameworks")
        if isinstance(frameworks, list) and any(
            isinstance(f, dict) for f in frameworks
        ):
            data["enabledFrameworks"] = [
                f.get("value") or f.get("optionId") or "" if isinstance(f, dict) else f
                for f in frameworks
            ]
            _patchkeys.append("enabledFrameworks")

        # ==============================
        # Coerce prompt list fields: bare dict → single-element list
        for key in ("attributesPrompt", "mitigationPrompt", "prompt"):
            val = data.get(key)
            if isinstance(val, dict):
                data[key] = [val]
                _patchkeys.append(key)

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


def _prompt_role_label_from_value(val: object) -> str:
    """Extract a valid role label from a raw field value, including legacy list shapes.

    Legacy documents stored role_label as a list whose first element was the
    option key (e.g. 'option_chain_prompt') and whose second element was the
    human-readable label (e.g. 'Chain Prompt').  This helper iterates the list
    to find the first element that passes prompt_role_label validation instead of
    blindly taking index 0.
    """
    if isinstance(val, list):
        for item in val:
            try:
                candidate = prompt_role_label(item)
                if candidate:
                    return candidate
            except ValueError:
                continue
        return prompt_role_label(val[0] if val else None)
    return prompt_role_label(val)


def _migrate_llm_configuration_option_fields(llm_config: dict) -> bool:
    """Coerce LabelValueOption dicts to canonical strings in-place. Returns True if any field changed."""
    changed = False
    # Legacy configurations used "role"; runtime generators consume role_label.
    if "role" in llm_config and "role_label" not in llm_config:
        llm_config["role_label"] = llm_config.pop("role")
        changed = True
    for key in (
        "applyLlmModelToAllStages",
        "llmModelSingle",
        "role_label",
    ):
        val = llm_config.get(key)
        if key == "role_label":
            next_role = _prompt_role_label_from_value(val)
            if next_role != llm_config.get(key):
                llm_config[key] = next_role
                changed = True
            continue
        if isinstance(val, list):
            val = val[0] if val else None
        if isinstance(val, dict):
            next_value = val.get("canonicalName") or val.get("value") or ""
            if isinstance(next_value, str) and next_value.startswith("option_"):
                next_value = ""
            llm_config[key] = next_value
            changed = True
    if "generationOption" in llm_config and "prompt_type" not in llm_config:
        llm_config["prompt_type"] = llm_config["generationOption"]
        changed = True
    if "prompt_type" in llm_config:
        next_prompt_type = canonical_prompt_type(llm_config.get("prompt_type"))
        if next_prompt_type != llm_config.get("prompt_type"):
            llm_config["prompt_type"] = next_prompt_type
            changed = True
    frameworks = llm_config.get("enabledFrameworks")
    if isinstance(frameworks, list) and any(isinstance(f, dict) for f in frameworks):
        llm_config["enabledFrameworks"] = [
            f.get("value") or f.get("optionId") or "" if isinstance(f, dict) else f
            for f in frameworks
        ]
        changed = True
    return changed


def _normalize_datetime_string(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict) and isinstance(value.get("$date"), str):
        return value["$date"]
    return value


class ProjectRegisterBaseValidator(AbstractValidator):
    patchVer_ = "patch_a4c7e2f9-3d81-4b56-8e0a-1f2c9d5b7a43"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        # Migrate assessment.version → top-level assessment_id
        if isinstance(data.get("assessment"), dict) and "version" in data["assessment"]:
            version = data["assessment"].pop("version")
            if not data.get("assessment_id") and version:
                data["assessment_id"] = version
            _patchkeys.append("assessment")
            _unsetkeys.append("assessment.version")

        # ==============================
        # Promote assessment.assessment_id → top-level assessment_id.
        # Documents previously stored the id inside the assessment sub-object;
        # it now lives at the top level, matching ProjectAssessmentBaseModel.
        if isinstance(data.get("assessment"), dict) and data["assessment"].get(
            "assessment_id"
        ):
            if not data.get("assessment_id"):
                data["assessment_id"] = data["assessment"].pop("assessment_id")
            else:
                data["assessment"].pop("assessment_id")
            _patchkeys.append("assessment_id")
            _unsetkeys.append("assessment.assessment_id")

        # ==============================
        # Migrate flat assessment_benchmark → assessment.benchmark
        if "assessment_benchmark" in data:
            if not isinstance(data.get("assessment"), dict):
                data["assessment"] = {}
            if not data["assessment"].get("benchmark"):
                data["assessment"]["benchmark"] = data.pop("assessment_benchmark")
            else:
                data.pop("assessment_benchmark")
            _patchkeys.append("assessment")
            _unsetkeys.append("assessment_benchmark")

        # ==============================
        # Migrate flat assessment_config → assessment.configuration
        if "assessment_config" in data:
            if not isinstance(data.get("assessment"), dict):
                data["assessment"] = {}
            if not data["assessment"].get("configuration"):
                data["assessment"]["configuration"] = data.pop("assessment_config")
            else:
                data.pop("assessment_config")
            _patchkeys.append("assessment")
            _unsetkeys.append("assessment_config")

        _configuration = (data.get("assessment") or {}).get("configuration")
        if isinstance(_configuration, dict):
            _configuration_values = _configuration.get("values")
            _has_generated_values_shape = isinstance(
                _configuration_values, dict
            ) and any(
                config_type in _configuration_values
                for config_type in ("ai", "pentest")
            )
            if _has_generated_values_shape:
                if not _configuration.get("config_values"):
                    _configuration["config_values"] = _configuration_values
                _configuration.pop("values", None)
                _patchkeys.append("assessment")
                _unsetkeys.append("assessment.configuration.values")

            if "generated_values" in _configuration:
                if not _configuration.get("config_values") and isinstance(
                    _configuration.get("generated_values"), dict
                ):
                    _configuration["config_values"] = _configuration["generated_values"]
                _configuration.pop("generated_values")
                _patchkeys.append("assessment")
                _unsetkeys.append("assessment.configuration.generated_values")

            _merged_form_values = {}
            if isinstance(_configuration.get("values"), dict):
                _merged_form_values.update(_configuration["values"])
            for _legacy_key in ("ai_values", "pentest_values"):
                _legacy_values = _configuration.get(_legacy_key)
                if isinstance(_legacy_values, dict):
                    _merged_form_values.update(_legacy_values)
                if _legacy_key in _configuration:
                    _configuration.pop(_legacy_key)
                    _unsetkeys.append(f"assessment.configuration.{_legacy_key}")
            if _merged_form_values:
                _configuration["values"] = _merged_form_values
                _patchkeys.append("assessment")
                if "assessment.configuration.values" in _unsetkeys:
                    _unsetkeys.remove("assessment.configuration.values")

        # ==============================
        # Strip assessment_id from assessment.benchmark and assessment.configuration —
        # the canonical id belongs at top-level assessment_id only.
        for _sub_key in ("benchmark", "configuration"):
            _sub = (data.get("assessment") or {}).get(_sub_key)
            if isinstance(_sub, dict) and "assessment_id" in _sub:
                data["assessment"][_sub_key] = {
                    k: v for k, v in _sub.items() if k != "assessment_id"
                }
                _patchkeys.append("assessment")
                _unsetkeys.append(f"assessment.{_sub_key}.assessment_id")

        # ==============================
        # Strip assessment_id from assessment.benchmark.checkpoints[*].metadata.
        # MongoDB cannot $unset nested array element paths; the whole assessment
        # sub-object is rewritten via _patchkeys so no _unsetkeys entry is needed.
        _bm = (data.get("assessment") or {}).get("benchmark")
        if isinstance(_bm, dict):
            _checkpoints = _bm.get("checkpoints") or []
            if any(
                isinstance(cp.get("metadata"), dict)
                and "assessment_id" in cp.get("metadata", {})
                for cp in _checkpoints
            ):
                _bm["checkpoints"] = [
                    {
                        **cp,
                        "metadata": {
                            k: v
                            for k, v in cp["metadata"].items()
                            if k != "assessment_id"
                        },
                    }
                    if isinstance(cp.get("metadata"), dict)
                    and "assessment_id" in cp.get("metadata", {})
                    else cp
                    for cp in _checkpoints
                ]
                _patchkeys.append("assessment")

        # ==============================
        # Migrate flat category_options / risk_info / subcategory_options → legacy.*
        for _leg_key in ("category_options", "risk_info", "subcategory_options"):
            if _leg_key in data:
                if not isinstance(data.get("legacy"), dict):
                    data["legacy"] = {}
                if not data["legacy"].get(_leg_key):
                    data["legacy"][_leg_key] = data.pop(_leg_key)
                else:
                    data.pop(_leg_key)
                _patchkeys.append("legacy")
                _unsetkeys.append(_leg_key)

        # ==============================
        # Move ref.category_options, ref.risk_info, ref.subcategory_options → legacy.*
        for _leg_key in ("category_options", "risk_info", "subcategory_options"):
            if isinstance(data.get("ref"), dict) and data["ref"].get(_leg_key):
                if not isinstance(data.get("legacy"), dict):
                    data["legacy"] = {}
                if not data["legacy"].get(_leg_key):
                    data["legacy"][_leg_key] = data["ref"].pop(_leg_key)
                else:
                    data["ref"].pop(_leg_key)
                _patchkeys.append("legacy")
                _patchkeys.append("ref")
                _unsetkeys.append(f"ref.{_leg_key}")

        # ==============================
        # Move ref.cq_version_id and ref.ad_version_id → assessment sub-object.
        for _ver_key in ("cq_version_id", "ad_version_id"):
            if isinstance(data.get("ref"), dict) and data["ref"].get(_ver_key):
                if not isinstance(data.get("assessment"), dict):
                    data["assessment"] = {}
                if not data["assessment"].get(_ver_key):
                    data["assessment"][_ver_key] = data["ref"].pop(_ver_key)
                else:
                    data["ref"].pop(_ver_key)
                _patchkeys.append("assessment")
                _patchkeys.append("ref")
                _unsetkeys.append(f"ref.{_ver_key}")

        # ==============================
        # Migrate flat mitigation_measures_ranking → mitigation.ranking
        if "mitigation_measures_ranking" in data:
            if not isinstance(data.get("mitigation"), dict):
                data["mitigation"] = {}
            if not data["mitigation"].get("ranking"):
                data["mitigation"]["ranking"] = data.pop("mitigation_measures_ranking")
            else:
                data.pop("mitigation_measures_ranking")
            _patchkeys.append("mitigation")
            _unsetkeys.append("mitigation_measures_ranking")

        # ==============================
        # Migrate flat integration_mapping → integration
        if "integration_mapping" in data:
            if not isinstance(data.get("integration"), dict):
                data["integration"] = data.pop("integration_mapping")
            else:
                data.pop("integration_mapping")
            _patchkeys.append("integration")
            _unsetkeys.append("integration_mapping")

        # ==============================
        llm = data.get("llm")
        if "llm" in data:
            data.setdefault("review", {})
            data["review"]["llmScenarios"] = llm.get("riskScenarios", [])
            del data["llm"]
            _patchkeys.append("review")
            _unsetkeys.append("llm")

        # ==============================
        # Unset legacy flat fields not present in the model
        for _legacy_key in (
            "cache_risk_scenarios",
            "is_initialized",
            "lastAssessedBy",
            "lastAssessedOn",
        ):
            if _legacy_key in data:
                data.pop(_legacy_key)
                _unsetkeys.append(_legacy_key)

        # ==============================
        # Migrate LLMConfiguration option fields from {label, value} dicts to str option IDs
        _llm_c = ((data.get("assessment") or {}).get("configuration") or {}).get(
            "llm_configuration"
        )
        if isinstance(_llm_c, dict) and _migrate_llm_configuration_option_fields(
            _llm_c
        ):
            _patchkeys.append("assessment")

        # ==============================
        # Drop inline-content file values from assessment.configuration.values.
        # Before the project_assessment_config_files collection existed, uploaded
        # file content was stored as base64 directly in the register. Any list
        # item that has "content" but no "file_id" is that old format; discard it
        # so the field becomes an empty list and the client must re-upload.
        _cfg_vals = ((data.get("assessment") or {}).get("configuration") or {}).get(
            "values"
        )
        if isinstance(_cfg_vals, dict):
            for _fid, _fval in list(_cfg_vals.items()):
                if not isinstance(_fval, list):
                    continue
                _clean = [
                    item
                    for item in _fval
                    if not (
                        isinstance(item, dict)
                        and "content" in item
                        and "file_id" not in item
                    )
                ]
                if len(_clean) != len(_fval):
                    _cfg_vals[_fid] = _clean
                    _patchkeys.append("assessment")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectAssessmentBaseValidator(ProjectRegisterBaseValidator):
    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        saved_id = ""
        data = cls.normalize_data(data)

        if isinstance(data, dict):
            data = {**data}
            saved_id = data.pop("assessment_id", None) or ""
            if not saved_id:
                assessment = data.get("assessment") or {}
                if isinstance(assessment, dict):
                    saved_id = (
                        assessment.get("assessment_id")
                        or assessment.get("version")
                        or ""
                    )

        model = super().get_validated_model(
            data=data,
            handler=handler,
        )
        if saved_id and not model.assessment_id:
            model.assessment_id = saved_id
        return model


class AssessmentDataValidator(AbstractValidator):
    patchVer_ = "patch_9f3816c1-6285-4d55-a41e-7455319904fb"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        for key in ("benchmark", "configuration"):
            sub = data.get(key)
            if isinstance(sub, dict) and "assessment_id" in sub:
                data[key] = {k: v for k, v in sub.items() if k != "assessment_id"}
                _patchkeys.append(key)
                _unsetkeys.append(f"{key}.assessment_id")

        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class AssessmentCheckpointValidator(AbstractValidator):
    patchVer_ = "patch_6d9eecdf-4987-4457-b4c8-6cd2367e95b4"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        meta = data.get("metadata")
        if isinstance(meta, dict) and "assessment_id" in meta:
            data = {
                **data,
                "metadata": {k: v for k, v in meta.items() if k != "assessment_id"},
            }
            _patchkeys.append("metadata")

        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class AssessmentBenchmarkValidator(AbstractValidator):
    patchVer_ = "patch_ef043275-12b6-4dbf-a490-408f53a03e43"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        for key in ("started_at", "finished_at"):
            if key in data:
                normalized_value = _normalize_datetime_string(data[key])
                if normalized_value != data[key]:
                    data[key] = normalized_value
                    _patchkeys.append(key)

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            model._patch = len(_patchkeys) > 0
            return model

        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class MasterRegisterBaseValidator(AbstractValidator):
    patchVer_ = "patch_3ff80f3b-c199-41a1-92e9-e77b026ec393"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class RiskScenarioCoreValidator(AbstractValidator):
    @classmethod
    def validate_model(
        cls,
        data: dict,
        _patchkeys: list[str],
    ):
        # ==============================
        if "defaultRiskLevel" in data and not isinstance(data["defaultRiskLevel"], int):
            data["defaultRiskLevel"] = data["defaultImpact"] * data["defaultLikelihood"]
            _patchkeys.append("defaultRiskLevel")

        # ==============================
        if "recommendedMitigationMeasures" in data and any(
            isinstance(_, dict) for _ in data["recommendedMitigationMeasures"]
        ):
            data["recommendedMitigationMeasures"] = [
                m["mitigationId"] for m in data["recommendedMitigationMeasures"]
            ]
            _patchkeys.append("recommendedMitigationMeasures")

        # ==============================
        if "explanationForGenerationRule" in data:
            data["ruleExplanation"] = data["explanationForGenerationRule"]
            _patchkeys.append("ruleExplanation")
        if "scenarioExplanation" in data:
            data["ruleExplanation"] = data["scenarioExplanation"]
            _patchkeys.append("ruleExplanation")


class MasterRiskScenarioValidator(AbstractValidator):
    patchVer_ = "patch_50e6f0e3-ef2e-4d67-a3ab-87d52e6a70b0"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        RiskScenarioCoreValidator.validate_model(
            data=data,
            _patchkeys=_patchkeys,
        )

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectRiskScenarioValidator(AbstractValidator):
    patchVer_ = "patch_cd163e7c-d296-4f8e-8b91-d1af02492b2e"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        RiskScenarioCoreValidator.validate_model(
            data=data,
            _patchkeys=_patchkeys,
        )

        # ==============================
        if "attackNarrativeSteps" in data:
            data["attackNarrative"] = data["attackNarrativeSteps"]
            _patchkeys.append("attackNarrative")

        # ==============================
        if "residualRiskLevel" in data and not isinstance(
            data["residualRiskLevel"], int
        ):
            data["residualRiskLevel"] = (
                data["residualImpact"] * data["residualLikelihood"]
            )
            _patchkeys.append("residualRiskLevel")

        # ==============================
        if "status" in data and data["status"] not in [
            "unresolved",
            "pendingSupport",
            "supported",
            "pendingApproval",
            "approved",
        ]:
            data["status"] = "unresolved"
            _patchkeys.append("status")

        # ==============================
        if "rapidsCategory" in data:
            data["frameworks"] = {
                "rapids": data["rapidsCategory"],
                "tm": [],
                "stride": [],
                "owasp": [],
            }
            del data["rapidsCategory"]
            _patchkeys.append("rapidsCategory")

        # ==============================
        tags = data.get("tags")
        if "tags" in data and "Focused" in tags:
            data["tags"] = [
                ScenarioTags.prioritized.value if _ == "Focused" else _ for _ in tags
            ]
            _patchkeys.append("tags")

        # ==============================
        tags = data.get("tags")
        ALLOWED_TAGS = [
            ScenarioTags.prioritized.value,
            ScenarioTags.questionnaireUpdate.value,
            ScenarioTags.masterScenarioUpdate.value,
            ScenarioTags.deprecated.value,
        ]
        if "tags" in data and any(_ not in ALLOWED_TAGS for _ in tags):
            data["tags"] = [_ for _ in tags if _ in ALLOWED_TAGS]
            _patchkeys.append("tags")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectRegisterStatsValidator(AbstractValidator):
    patchVer_ = "patch_5b6500b5-27aa-4f46-8839-2d92aa72f883"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "defaultRiskLevel" in data and not isinstance(data["defaultRiskLevel"], int):
            data["defaultRiskLevel"] = cls.getRiskValue(data["defaultRiskLevel"])
            _patchkeys.append("defaultRiskLevel")

        # ==============================
        if "residualRiskLevel" in data and not isinstance(
            data["residualRiskLevel"], int
        ):
            data["residualRiskLevel"] = cls.getRiskValue(data["residualRiskLevel"])
            _patchkeys.append("residualRiskLevel")

        # ==============================
        if "rapidsCategory" in data:
            data["frameworks"] = {
                "rapids": data["rapidsCategory"],
                "tm": [],
                "stride": [],
                "owasp": [],
            }
            del data["rapidsCategory"]
            _patchkeys.append("rapidsCategory")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model

    @staticmethod
    def getRiskValue(level: str):
        if level == "Unspecified":
            return 0
        if level == "Low":
            return 1
        if level == "Medium":
            return 4
        if level == "Medium High":
            return 9
        if level == "High":
            return 16
        if level == "Very High":
            return 25
        return 0


class ProjectADBaseValidator(AbstractValidator):
    patchVer_ = "patch_550f94b9-3b62-49c5-ac03-9e8947620ca0"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        canvas_views = data.get("canvas_views")
        canvas = data.get("canvas")
        if isinstance(canvas_views, list) and isinstance(canvas, dict):
            model_batch_helper = ModelBatchHelper()
            _canvas = model_batch_helper.convertCanvasViewsToCanvas(
                canvas, canvas_views
            )
            data["canvas"] = _canvas
            _patchkeys.append("canvas")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectCactiBaseValidator(AbstractValidator):
    patchVer_ = "patch_3c37a81c-a566-4aae-af6c-e5d69ea1ac35"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "data" in data:
            file = {
                "data": data["data"],
                "file_id": data["doc_version"] or f"cacti_{uuid.uuid4()}",
                "filename": data["filename"],
                "timestamp": data["uploadDate"],
            }
            data["files"] = [file]
            _patchkeys.append("files")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectCactiFileBaseValidator(AbstractValidator):
    patchVer_ = "patch_6d521eb4-dc78-4469-8c57-1d5c2d92acbb"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "doc_version" in data:
            data["file_id"] = data["doc_version"]
            _patchkeys.append("file_id")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class RuleExplanationValidator(AbstractValidator):
    patchVer_ = "patch_529818ad-6ab2-4283-b497-e2cc12ca0104"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        applicability = data.get("applicability")
        if "applicability" in data and isinstance(applicability, str):
            data["applicability"] = {
                "evidence": [],
                "explanation": [applicability],
                "result": "",
            }
            _patchkeys.append("applicability")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class RuleExplanationAttributeValidator(AbstractValidator):
    patchVer_ = "patch_d50eae0e-f5cf-4d26-a896-e0c9a8bef6fd"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        evidence = data.get("evidence")
        if "evidence" in data and isinstance(evidence, str):
            data["evidence"] = [evidence]
            _patchkeys.append("evidence")

        # ==============================
        explanation = data.get("explanation")
        if "explanation" in data and isinstance(explanation, str):
            data["explanation"] = [explanation]
            _patchkeys.append("explanation")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class AttackFlowPackageValidator(AbstractValidator):
    patchVer_ = "patch_ac5e6c6d-12f2-4633-84bb-10bba8586eb8"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "attack_narrative_steps" in data:
            data["attack_narrative"] = data["attack_narrative_steps"]

            _patchkeys.append("attack_narrative")

        # ==============================
        if "rapidsCategory" in data:
            data["frameworks"] = {
                "rapids": data["rapidsCategory"],
                "tm": [],
                "stride": [],
                "owasp": [],
            }
            del data["rapidsCategory"]
            _patchkeys.append("rapidsCategory")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class CanvasNodeBaseValidator(AbstractValidator):
    patchVer_ = "patch_b6015aef-91b3-46e0-8638-08e6bd2a24e8"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        parentNode = data.get("parentNode")
        if "parentNode" in data:
            data["parentId"] = parentNode or ""
            _patchkeys.append("parentId")

        # ==============================
        if "positionAbsolute" in data:
            del data["positionAbsolute"]
            _patchkeys.append("positionAbsolute")

        # ==============================
        if "origin" not in data:
            data["origin"] = [0, 0]
            _patchkeys.append("origin")

        # ==============================
        if "handles" in data:
            del data["handles"]
            _patchkeys.append("handles")

        # ==============================
        if "zIndex" in data:
            data["zIndex"] = 1
            _patchkeys.append("zIndex")

        # ==============================
        node_data = data.get("data", {})
        if "clusterNodeType" in node_data:
            del node_data["clusterNodeType"]
            _patchkeys.append("data")

        # ==============================
        node_data = data.get("data", {})
        if (
            data.get("type", "") == CanvasNodeVariantType.clusterNode.value
            and "publiclyAccessible" not in node_data
        ):
            node_data["publiclyAccessible"] = False
            _patchkeys.append("data")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class CanvasDataBaseValidator(AbstractValidator):
    patchVer_ = "patch_1c3f8b0d-2a4e-4b6c-9f5d-7e2c8f0a1b2c"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "nodes" in data:
            nodes = data["nodes"]
            sorter = CanvasNodeSorter()
            sorter.sort_nodes_by_parent_child(
                nodes=nodes,
            )
            _patchkeys.append("nodes")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class ProjectRegisterHistoryBaseValidator(AbstractValidator):
    patchVer_ = "patch_b7e4d293-1a60-4f8c-e172-9c36b5d0a847"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "compliance_stats" in data:
            _unsetkeys.append("compliance_stats")
        if "design_stats" in data:
            _unsetkeys.append("design_stats")
        if "others_stats" in data:
            _unsetkeys.append("others_stats")
        if "rapids_stats" in data:
            _unsetkeys.append("rapids_stats")
        if "total_stats" in data:
            _unsetkeys.append("total_stats")

        # ==============================
        # Unset legacy outer-level assessment_id —
        # these belong inside history snapshot items, not the outer doc.
        for _legacy_key in ("assessment_id",):
            if _legacy_key in data:
                data.pop(_legacy_key)
                _unsetkeys.append(_legacy_key)

        # ==============================
        # Migrate LLMConfiguration option fields from {label, value} dicts to str option IDs
        _llm_c = ((data.get("assessment") or {}).get("configuration") or {}).get(
            "llm_configuration"
        )
        if isinstance(_llm_c, dict) and _migrate_llm_configuration_option_fields(
            _llm_c
        ):
            _patchkeys.append("assessment")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class CQTemplateFieldTemplateValidator(AbstractValidator):
    patchVer_ = "patch_74f41603-96b2-4c2a-83f0-99c7c3b51a0b"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "template_id" not in data:
            data["template_id"] = data.get("templateId") or f"template_{uuid.uuid4()}"
            _patchkeys.append("template_id")

        # ==============================
        if "template_name" not in data:
            data["template_name"] = data.get("templateName") or data.get("name") or ""
            _patchkeys.append("template_name")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class CQTemplateFormTemplateValidator(AbstractValidator):
    patchVer_ = "patch_49193329-4fd3-40c7-9ebb-49b95c890720"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "template_id" not in data:
            data["template_id"] = data.get("templateId") or f"template_{uuid.uuid4()}"
            _patchkeys.append("template_id")

        # ==============================
        if "template_name" not in data:
            data["template_name"] = data.get("templateName") or data.get("name") or ""
            _patchkeys.append("template_name")

        # description
        if "description" not in data:
            data["description"] = ""
            _patchkeys.append("description")

        # use_cases
        if "use_cases" not in data:
            data["use_cases"] = []
            _patchkeys.append("use_cases")

        # tags
        if "tags" not in data:
            data["tags"] = []
            _patchkeys.append("tags")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class KnowledgeBaseMappingValidator(AbstractValidator):
    patchVer_ = "patch_1147a92d-c817-4caa-aa95-bf672d112702"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "source" in data and data["source"] == "Master IM8":
            data["source"] = "IM8"
            _patchkeys.append("source")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class UserBaseValidator(AbstractValidator):
    patchVer_ = "patch_9df67884-030a-40f8-b2ab-e63549705f58"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = data or {}
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        if "tnc_acceptance_records" not in data:
            data["tnc_acceptance_records"] = []
            _patchkeys.append("tnc_acceptance_records")

        # ==============================
        if "onboarding" not in data:
            data["onboarding"] = {
                "required_steps": [],
                "completed_steps": [],
                "is_complete": False,
            }
            _patchkeys.append("onboarding")

        # ==============================
        if "onboarding" in data:
            onboarding = data["onboarding"]
            if not isinstance(onboarding, dict):
                onboarding = {}
                data["onboarding"] = onboarding
                _patchkeys.append("onboarding")

            # Always keep required_steps as empty list - it's set programmatically from settings
            if (
                "required_steps" not in onboarding
                or onboarding.get("required_steps") != []
            ):
                onboarding["required_steps"] = []
                data["onboarding"] = onboarding
                _patchkeys.append("onboarding")

        # ==============================
        if "terms_and_conditions" in data:
            _unsetkeys.append("terms_and_conditions")

        # ==============================
        if "tnc" in data:
            _unsetkeys.append("tnc")

        # ==============================
        # Keep admin flags internally consistent with core identity fields.
        computed_is_admin = derive_is_admin(
            is_superuser=data.get("is_superuser"),
            entitlements=data.get("entitlements"),
            current_is_admin=data.get("is_admin"),
        )
        if data.get("is_admin") is not computed_is_admin:
            data["is_admin"] = computed_is_admin
            _patchkeys.append("is_admin")

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class AttackGraphRuleValidator(AbstractValidator):
    patchVer_ = "patch_5415a505-9ff7-4853-880d-8d33ef91aa9e"


class CanvasEdgeBaseValidator(AbstractValidator):
    patchVer_ = "patch_5415a505-9ff7-4853-880d-8d33ef91aa9d"


class MasterADTemplateBaseValidator(AbstractValidator):
    patchVer_ = "patch_6b7685f9-c5d8-43aa-84e9-7084f89130e3"


class CQCoreValidator(AbstractValidator):
    patchVer_ = "patch_b7493b2e-39d5-4e77-be6c-009ed91b272b"


class CQTemplateCoreValidator(AbstractValidator):
    patchVer_ = "patch_1e2845d7-89d6-41f7-9ac5-910d20401171"


class ResourceTagBaseValidator(AbstractValidator):
    patchVer_ = "patch_766aa3b6-aae5-442a-afe2-3f5adf7d52a2"


class TokenBaseValidator(AbstractValidator):
    patchVer_ = "patch_82eb50f5-8115-4ed3-a44f-59d1487bb5b0"


class KbLLMPromptBaseValidator(AbstractValidator):
    patchVer_ = "patch_77620afd-5b25-49e4-bbc2-8f6fc35ad748"


class KbAssessmentConfigBaseValidator(AbstractValidator):
    patchVer_ = "patch_20a65733-96a4-46bf-a560-b2a0538aa11d"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        sections = data.get("sections")
        if not isinstance(sections, list):
            data["sections"] = []
            for section_id, section_name in (
                ("main_engine", "Main Engine"),
                ("ai", "AI"),
                ("pentest", "Pentest"),
            ):
                legacy_section = data.get(section_id)
                questions = []
                if isinstance(legacy_section, dict):
                    questions = legacy_section.get("questions") or []
                data["sections"].append(
                    {
                        "sectionId": section_id,
                        "sectionName": section_name,
                        "questions": questions,
                        "subsections": [],
                        "summary": {"footer": ""},
                    }
                )
            _patchkeys.append("sections")

        ai_config = data.get("ai")
        if (
            isinstance(ai_config, dict)
            and "defaultOptionsGroup" not in data
            and isinstance(ai_config.get("defaultOptionsGroup"), dict)
        ):
            data["defaultOptionsGroup"] = ai_config["defaultOptionsGroup"]
            _patchkeys.append("defaultOptionsGroup")
        if (
            isinstance(ai_config, dict)
            and "defaultOptions" not in data
            and isinstance(ai_config.get("defaultOptions"), dict)
        ):
            data["defaultOptions"] = ai_config["defaultOptions"]
            _patchkeys.append("defaultOptions")

        for legacy_key in ("ai", "pentest"):
            if legacy_key in data:
                del data[legacy_key]
                _unsetkeys.append(legacy_key)

        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class CreditTransactionLogBaseValidator(AbstractValidator):
    patchVer_ = "patch_8b3d2e9c-5f4a-4e7d-b1c6-9a0f3e2d7b4e"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            model = handler(data)
            return model

        # ==============================
        # Migrate flat delta/balance fields → nested ai/reporting structure
        if "ai" not in data:
            data["ai"] = {
                "st_delta": data.pop("st_delta", 0),
                "mt_delta": data.pop("mt_delta", 0),
                "mc_delta": data.pop("mc_delta", 0),
                "lt_delta": data.pop("lt_delta", 0),
                "st_balance_after": data.pop("st_balance_after", 0),
                "mt_balance_after": data.pop("mt_balance_after", 0),
                "mc_balance_after": data.pop("mc_balance_after", 0),
                "lt_balance_after": data.pop("lt_balance_after", 0),
            }
            _patchkeys.append("ai")
            _unsetkeys.extend([
                "st_delta", "mt_delta", "mc_delta", "lt_delta",
                "st_balance_after", "mt_balance_after", "mc_balance_after", "lt_balance_after",
            ])

        # Accept old "diagram" nested doc, old "report_gen" nested doc, or flat fields → "reporting"
        if "reporting" not in data:
            old_diag = data.pop("diagram", None) or {}
            old_rgen = data.pop("report_gen", None) or {}
            data["reporting"] = {
                "reporting_delta": data.pop("reporting_delta",
                    old_rgen.get("report_gen_delta",
                    old_diag.get("export_delta",
                    data.pop("diagram_export_delta", 0)))),
                "reporting_balance_after": data.pop("reporting_balance_after",
                    old_rgen.get("report_gen_balance_after",
                    old_diag.get("export_balance_after",
                    data.pop("diagram_export_balance_after", 0)))),
            }
            _patchkeys.append("reporting")
            _unsetkeys.extend([
                "diagram_export_delta", "diagram_export_balance_after", "diagram", "report_gen",
            ])

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model


class UserRoleDocBaseValidator(AbstractValidator):
    patchVer_ = "patch_15f9dee7-10ce-4962-8711-4d49efd817b5"


class UserPolicyDocBaseValidator(AbstractValidator):
    patchVer_ = "patch_703f0fe4-6d92-462e-a4d4-5a0c9659d62a"


class KbToscaBaseValidator(AbstractValidator):
    patchVer_ = "patch_bb4efffc-be4c-4e7b-b0db-4dd718eb0887"


class MasterMitigationBaseValidator(AbstractValidator):
    patchVer_ = "patch_2f68efcf-4d1d-4f5b-97e5-5ca85cc15c51"


class ProjectDiagramBaseValidator(AbstractValidator):
    patchVer_ = "patch_4b5e3ea7-52de-4839-8554-a5aef3946de5"


class ProjectDiagramFileBaseValidator(AbstractValidator):
    patchVer_ = "patch_99812a83-fdb0-4945-9d76-8e757bc151df"


class ProjectXMLBaseValidator(AbstractValidator):
    patchVer_ = "patch_3fa8a804-bfe4-4b21-986e-37ecc34916e9"


class ProjectXMLFileBaseValidator(AbstractValidator):
    patchVer_ = "patch_eb7bcbf5-9820-4866-81e7-cb411a214f3a"


class UserCreditsBaseValidator(AbstractValidator):
    patchVer_ = "patch_4a9f3e7b-2c1d-4b8e-96f5-3d2a0e7c8b5f"

    @classmethod
    def get_validated_model(
        cls,
        data: dict,
        handler: Callable[[dict], "PatchBaseModel"],
    ):
        data = cls.normalize_data(data)
        _patchkeys = []
        _unsetkeys = []

        if data.get("patchVer_") == cls.patchVer_:
            return handler(data)

        # ==============================
        # Migrate old "diagram" nested key OR old "report_gen" nested key → "reporting"
        if "reporting" not in data:
            if "diagram" in data:
                old_diag = data.pop("diagram", {}) or {}
                data["reporting"] = {
                    "reporting_credits": old_diag.get("export_credits", 0),
                    "reporting_credits_max": old_diag.get("export_credits_max", 0),
                    "reporting_last_renewed_at": old_diag.get("export_last_renewed_at"),
                }
                _patchkeys.append("reporting")
                _unsetkeys.append("diagram")
            elif "report_gen" in data:
                old_rgen = data.pop("report_gen", {}) or {}
                data["reporting"] = {
                    "reporting_credits": old_rgen.get("report_gen_credits", 0),
                    "reporting_credits_max": old_rgen.get("report_gen_credits_max", 0),
                    "reporting_last_renewed_at": old_rgen.get("report_gen_last_renewed_at"),
                }
                _patchkeys.append("reporting")
                _unsetkeys.append("report_gen")

        # ==============================
        # Track old flat-field keys so the migration task can $unset them
        for _old_key in (
            "st_credits", "st_credits_max", "st_last_renewed_at",
            "mt_credits", "mt_credits_max", "mt_last_renewed_at",
            "mc_credits", "mc_credits_max", "mc_last_renewed_at",
            "lt_credits", "lt_credits_max",
            "diagram_export_credits", "diagram_export_credits_max",
            "diagram_export_last_renewed_at",
            "report_gen_credits", "report_gen_credits_max", "report_gen_last_renewed_at",
        ):
            if _old_key in data:
                _unsetkeys.append(_old_key)

        # ==============================
        data["patchVer_"] = cls.patchVer_
        _patchkeys.append("patchVer_")

        # ==============================
        model = handler(data)
        model._patch = len(_patchkeys) > 0
        model._unset = len(_unsetkeys) > 0
        model._unsetkeys = _unsetkeys
        return model
