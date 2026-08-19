"""
Utility functions for the Risk Register Service.

This module provides common utility functions for file operations, data processing,
and other shared functionality across the risk register service.
"""

import json
import logging
import os
import re
import time
from collections import defaultdict
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import (
    ContextDictObject,
    EquationStructure,
    ProjectRiskScenario,
)

logger = logging.getLogger(__name__)


class GlobalSharedUtil:
    """Utility class providing common functionality for the Risk Register Service."""

    @staticmethod
    def _get_output_directory(
        file_path: str | None = None,
        root_folder_path: str | None = None,
    ) -> str:
        """
        Get the output directory for file operations.

        Args:
            file_path: Optional custom file path. If None, uses default results directory.

        Returns:
            str: The output directory path.
        """
        if file_path is None:
            # DEFAULT: writing to risk_register_service/service/lib/results
            cur_path = os.path.dirname(__file__)
            return os.path.join(cur_path, "results")
        else:
            # Ensure file_path does not start with a slash
            file_path = file_path.lstrip("/")
            if root_folder_path:
                return os.path.join(root_folder_path, file_path)
            return os.path.join(os.getcwd(), file_path)

    @staticmethod
    @raise_exception(
        "Failed to write to file.",
        exception_logger=logger,
    )
    def write_to_file(
        file_name: str,
        item: Any,
        format: str = "json",
        file_path: str | None = None,
        allow_write: bool = False,
        allow_write_global: bool = False,
        root_folder_path: str | None = None,
    ) -> None:
        """
        Write data to a file in JSON format.

        Args:
            file_name: Name of the file (without extension).
            item: Data to write to the file.
            format: File format/extension (default: "json").
            file_path: Optional custom file path. If None, uses default results directory.
            allow_write: Whether to allow writing.
            allow_write_global: Optional external global write switch.
            root_folder_path: Optional root path used when file_path is relative.
        """
        if allow_write or allow_write_global:
            output_dir = GlobalSharedUtil._get_output_directory(
                file_path=file_path,
                root_folder_path=root_folder_path,
            )
            file_path_full = os.path.join(output_dir, f"{file_name}.{format}")

            # Ensure directory exists
            os.makedirs(output_dir, exist_ok=True)

            with open(file_path_full, "w", encoding="utf-8") as f:
                json.dump(item, f, indent=4)

    @staticmethod
    @raise_exception(
        "Failed to append to file.",
        exception_logger=logger,
    )
    def append_to_file(
        file_name: str,
        item: Any,
        format: str = "json",
        file_path: str | None = None,
        allow_write: bool = False,
        allow_write_global: bool = False,
        root_folder_path: str | None = None,
    ) -> None:
        """
        Append data to a file in JSON format.

        Args:
            file_name: Name of the file (without extension).
            item: Data to append to the file.
            format: File format/extension (default: "json").
            file_path: Optional custom file path. If None, uses default results directory.
            allow_write: Whether to allow writing.
            allow_write_global: Optional external global write switch.
            root_folder_path: Optional root path used when file_path is relative.
        """
        if allow_write or allow_write_global:
            output_dir = GlobalSharedUtil._get_output_directory(
                file_path=file_path,
                root_folder_path=root_folder_path,
            )
            file_path_full = os.path.join(output_dir, f"{file_name}.{format}")

            # Ensure directory exists
            os.makedirs(output_dir, exist_ok=True)

            with open(file_path_full, "a", encoding="utf-8") as f:
                json.dump(item, f, indent=4)

    @staticmethod
    @raise_exception(
        "Failed to load json.",
        exception_logger=logger,
    )
    def load_json(filename: str) -> Any | None:
        """
        Load JSON data from a file.

        Args:
            filename: Path to the JSON file to load.

        Returns:
            Parsed JSON data, or None if loading fails.
        """
        try:
            with open(filename, encoding="utf-8") as f:
                data = json.load(f)
            logger.info(
                f"[ RR-CORE ] Successfully loaded JSON from {os.path.basename(filename)}"
            )
            return data
        except FileNotFoundError:
            logger.error(f"File not found: {filename}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in file {filename}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error loading JSON from {filename}: {e}")
            return None

    @classmethod
    @raise_exception(
        "Failed to read data from json.",
        exception_logger=logger,
    )
    def read_data_from_json(
        cls,
        filename: str,
        key: str | None = None,
    ) -> Any | None:
        """
        Read data from a JSON file with optional key extraction.

        Args:
            filename: Path to the JSON file to read.
            key: Optional key to extract from the JSON data.

        Returns:
            JSON data or specific key value, or None if reading fails.
        """
        if not os.path.isfile(filename):
            logger.error(f"File does not exist: {filename}")
            return None

        logger.info(f"[ RR-CORE ] Reading file <{os.path.basename(filename)}> ...")
        data = cls.load_json(filename)

        if data is None:
            logger.error(f"Failed to load JSON data from {filename}")
            return None

        if key:
            return data.get(key)
        return data

    @staticmethod
    def performance_timer(func):
        """
        Decorator to measure and log function execution time.

        Args:
            func: The function to be timed.

        Returns:
            Decorated function that logs execution time.
        """

        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            execution_time = end_time - start_time
            logger.info(
                f"[ RR-CORE ] Function '{func.__name__}' completed in {execution_time:.4f} seconds"
            )
            return result

        return wrapper

    @staticmethod
    @raise_exception(
        "Failed to parse equation to string.",
        exception_logger=logger,
    )
    def parse_equation_to_string(eqn_struc: dict | EquationStructure) -> str:
        """
        Parse an equation structure to a string representation.

        Args:
            eqn_struc: Equation structure as dict or EquationStructure object.

        Returns:
            String representation of the equation.
        """
        if isinstance(eqn_struc, dict):
            eqn_struc = EquationStructure(**eqn_struc)

        answer_string = ""
        parameter_type = eqn_struc.parameter_type

        if parameter_type == "string":
            answer_string = f"{eqn_struc.expression}('{eqn_struc.attribute}','{eqn_struc.parameters}')"

        elif parameter_type == "list":
            parameter_string = "','".join(eqn_struc.parameters)
            answer_string = f"{eqn_struc.expression}('{eqn_struc.attribute}',['{parameter_string}'])"

        elif parameter_type == "list_of_functions":
            if isinstance(eqn_struc.attribute, str):
                answer_string = f"{eqn_struc.expression}('{eqn_struc.attribute}',{eqn_struc.parameters})"
            else:
                answer_string = f"{eqn_struc.expression}({eqn_struc.attribute}, {eqn_struc.parameters})"

        elif parameter_type == "match":
            answer_string = f"{eqn_struc.expression}('{eqn_struc.attribute}','{eqn_struc.parameters}')"

        elif parameter_type == "filter":
            answer_string = (
                f"{eqn_struc.expression}({eqn_struc.attribute}, {eqn_struc.parameters})"
            )

        elif parameter_type == "permissions_check":
            answer_string = (
                f"{eqn_struc.expression}({eqn_struc.attribute}, {eqn_struc.parameters})"
            )

        elif parameter_type == "set":
            answer_string = f"{eqn_struc.expression}('{eqn_struc.attribute}', {eqn_struc.parameters})"

        return answer_string

    @staticmethod
    @raise_exception(
        "Failed to get key by value.",
        exception_logger=logger,
    )
    def get_key_by_value(dictionary: dict[str, Any], value: Any) -> str | None:
        """
        Get the first key that matches the given value in a dictionary.

        Args:
            dictionary: Dictionary to search in.
            value: Value to search for.

        Returns:
            First matching key, or None if not found.
        """
        for key, val in dictionary.items():
            if val == value:
                return key
        return ""

    @staticmethod
    @raise_exception(
        "Failed to replace placeholders.",
        exception_logger=logger,
    )
    def replace_placeholders(text, replacement_dict, mode) -> str:
        """
        Replace placeholders in text with values from a dictionary.

        Placeholders are in the format <key> and will be replaced with replacement_dict[key].

        Args:
            text: Text containing placeholders.
            replacement_dict: Dictionary mapping placeholder keys to replacement values.

        Returns:
            Text with placeholders replaced.
        """

        def repl(m) -> str:
            keys_str = m.group(1)  # e.g. "compute1, compute2"
            keys = [k.strip() for k in keys_str.split(",")]

            replacements = []
            for key in keys:
                if key in replacement_dict:
                    replacements.extend(replacement_dict[key])
                else:
                    replacements.append(f"<{key}>")

            replacements = list(set(replacements))

            return GlobalSharedUtil.list_strings_to_string(replacements)

        def repl_template_only(m) -> str:
            key = m.group(1)
            repl_value_list = replacement_dict.get(key, m.group(0))
            return GlobalSharedUtil.list_strings_to_string(repl_value_list)

        if mode == 4:
            return re.sub(r"<([^>]+)>", repl_template_only, text)

        return re.sub(r"<(.*?)>", repl, text)

    @staticmethod
    @raise_exception(
        "Failed to contextualize descriptors.",
        exception_logger=logger,
    )
    def contextualize_descriptors(
        template_str: str,
        context_dict: dict[str, list[ContextDictObject]],
        mode: int = 3,
    ):
        """
        mode 1: keep all general statements
        mode 2: keep all contextual statements
        mode 3: if all context is not found in a particular contextual statement, return the general statement
        mode 4: template only: no [][] for attack_narrative
        """
        accepted_mode = [1, 2, 3, 4]
        if not isinstance(mode, int) or mode not in accepted_mode:
            raise ValueError(f"Context mode {mode} is not accepted.")

        replacement_dict = (
            {k: list(set([i.label for i in v])) for k, v in context_dict.items()}
            if context_dict
            else {}
        )

        text = GlobalSharedUtil.replace_placeholders(
            template_str, replacement_dict, mode
        )

        if mode == 4:
            return text

        result = GlobalSharedUtil.resolve_template_phrases(text, mode)

        return result

    @staticmethod
    @raise_exception(
        "Failed to resolve template phrases.",
        exception_logger=logger,
    )
    def resolve_template_phrases(text, mode: int = 2):
        """
        Replace [phrase1][phrase2] pairs in text with either phrase1 or phrase2.

        Args:
            text (str): input string containing bracket pairs
            mode (int):
                1 to keep phrase1/general,
                2 to keep phrase2/context,
                3 conditional: keep phrase1 if phrase2 contains <[a-z0-9]> pattern, else phrase2

        Returns:
            str: modified string with pairs replaced by chosen phrase
        """
        if mode not in (1, 2, 3):
            raise ValueError("Argument 'keep' must be 1, 2, or 3")

        # pattern = re.compile(r'\[([^\]]+)\]\[([^\]]+)\]') # doesnt match empty []
        pattern = re.compile(r"\[([^\]]*)\]\[([^\]]*)\]")
        conditional_pattern = re.compile(r"<[a-zA-Z0-9_]+>")

        if mode in (1, 2):
            return pattern.sub(lambda m: m.group(mode), text)
        if mode == 3:

            def repl(m) -> str:
                phrase1, phrase2 = m.group(1), m.group(2)
                # If phrase2 contains <...>, keep phrase1 instead
                if conditional_pattern.search(phrase2):
                    return phrase1
                else:
                    return phrase2

            return pattern.sub(repl, text)

    @staticmethod
    @raise_exception(
        "Failed to convert list of strings to string.",
        exception_logger=logger,
    )
    def list_strings_to_string(items: list[str]) -> str:
        """
        Convert a list of strings to a human-readable string.

        Examples:
            [] -> ""
            ["apple"] -> "apple"
            ["apple", "banana"] -> "apple and banana"
            ["apple", "banana", "cherry"] -> "apple, banana and cherry"

        Args:
            items: List of strings to convert.

        Returns:
            Human-readable string representation.
        """
        if not items:
            return ""
        if len(items) == 1:
            return items[0]
        return ", ".join(items[:-1]) + " and " + items[-1]

    @staticmethod
    @raise_exception(
        "Failed to get rule apply to ids.",
        exception_logger=logger,
    )
    def get_rule_apply_to_ids(
        id_list: dict[str, list[str]], rule: dict[str, Any]
    ) -> list[str]:
        """
        Get the list of IDs that a rule applies to based on its applyTo configuration.

        Args:
            id_list: Dictionary mapping types to lists of IDs.
            rule: Rule dictionary containing applyTo configuration.

        Returns:
            List of IDs that the rule applies to.
        """
        apply_to = rule.get("applyTo", {})
        ids = set(apply_to.get("ids", []))
        types = set(apply_to.get("types", []))

        # If both empty, rule applies to everything
        if not ids and not types:
            return [y for x in id_list.values() for y in x]

        # If specific IDs are specified
        if ids:
            return list(ids)

        # If types are specified
        if types:
            result = []
            if "masterRiskRegister" in types:
                result.extend(id_list.get("masterRiskRegister", []))
            if "attackFlow" in types:
                result.extend(id_list.get("attackFlow", []))
            return result

        return []

    @staticmethod
    @raise_exception(
        "Failed to get rule applicable to package.",
        exception_logger=logger,
    )
    @staticmethod
    def check_if_rule_is_applicable(rule, applyToId: str) -> bool:
        apply_to = rule.get("applyTo", {})
        ids = set(apply_to.get("ids", []))
        types = set(apply_to.get("types", []))

        # If no restrictions, rule applies to everything
        if not ids and not types:
            return True

        # If specific IDs are specified
        if ids:
            return applyToId in rule["applyTo"]["ids"]

        # If types are specified
        if types:
            return "attack-flow-mapping" in types

        return False

    @raise_exception(
        "Failed to compute ranking for mitigation measures.",
        exception_logger=logger,
    )
    @staticmethod
    def compute_ranking_for_mitigation_measures(
        threat_scenario_models: list["ProjectRiskScenario"],
    ):
        priority_dict = {}
        measures_ranking = {}

        # debug_dict = {}

        # ======= Threat Scenarios ======== #
        total_threats = len(threat_scenario_models)

        measure_to_threat = defaultdict(list)

        for scen in threat_scenario_models:
            measureIds = scen.recommendedMitigationMeasures.copy() + [
                m.mitigationId for m in scen.actualMitigationMeasures
            ]
            measureIds = list(set(measureIds))
            # debug_dict = {
            #     _id: {"threats": [], "ranking": 0, "priority": 0} for _id in measureIds
            # }

            for measureId in measureIds:
                measure_to_threat[measureId].append((scen.riskScenarioId, scen.ranking))
                # item = {
                #     "riskScenarioId": scen.riskScenarioId,
                #     "ranking": scen.ranking,
                # }
                # debug_dict[measureId]["threats"].append(item)

        # compute priority scores
        # higher importance scenarios (ranking 1) contributes more
        for measureId, threats in measure_to_threat.items():
            priority = sum((total_threats - ranking + 1) for (_, ranking) in threats)
            priority_dict[measureId] = priority
            # debug_dict[measureId]["priority"] = priority

        # sort DESC as higher score = more important mitigation
        # measure with ranking 1 is the most important
        sorted_measures = sorted(
            priority_dict.items(), key=lambda x: x[1], reverse=True
        )

        # measures with the same score will have the same rank
        score_to_rank = {}
        for _, score in sorted_measures:
            if score not in score_to_rank:
                score_to_rank[score] = len(score_to_rank) + 1

        measures_ranking = {
            measureId: score_to_rank[score] for measureId, score in sorted_measures
        }

        # for measureId, rank in measures_ranking.items():
        #     debug_dict[measureId]["ranking"] = rank

        # GlobalSharedUtil.write_to_file(
        #     "measure_ranking_output", debug_dict, allow_write_global=True
        # )

        return measures_ranking

    @raise_exception(
        "Failed to get check update progress.",
        exception_logger=logger,
    )
    @staticmethod
    def check_update_progress(
        iteration: int,
        min_progress: int,
        max_progress: int,
        increment: int,
        total_steps: int,
    ) -> int:
        if total_steps <= 0:
            return max_progress
        if increment <= 0:
            return min_progress
        if max_progress <= min_progress:
            return min_progress

        total_increments = (max_progress - min_progress) // increment
        if total_increments <= 0:
            return min_progress

        iterations_per_increment = total_steps / total_increments
        if iterations_per_increment <= 0:
            return min_progress

        progress_step = int(iteration // iterations_per_increment)

        return min(min_progress + progress_step * increment, max_progress)
