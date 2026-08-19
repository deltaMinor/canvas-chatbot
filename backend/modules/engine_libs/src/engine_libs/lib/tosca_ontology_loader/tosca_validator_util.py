from __future__ import annotations

import json
import logging
import os
from typing import TYPE_CHECKING

from engine_libs.lib.tosca_validator.helper_classes import RuleInfo
from owlready2 import get_ontology

if TYPE_CHECKING:
    from shared_libs.protocols import OntologyProtocol

logger = logging.getLogger(__name__)


class ToscaValidatorUtil:
    @staticmethod
    def read_ontology_file(ontology_file: str) -> OntologyProtocol:
        ontology = None
        loaded = False
        max_tries = 3
        try_count = 1
        while not (loaded or try_count > max_tries):
            try:
                ontology = get_ontology(ontology_file).load(only_local=True)
                loaded = True
            except Exception as e:
                try_count += 1
                logger.warning(
                    "Failed to load ontology file %s. %s. Retrying ...",
                    ontology_file,
                    e,
                )
        if not ontology:
            logger.error("Failed to load ontology file %s.", ontology_file)
        else:
            logger.info(
                "[ ARCH-DIAGRAM ] Ontology file <%s> loaded successfully.",
                os.path.basename(ontology_file),
            )
        return ontology

    @staticmethod
    def read_rules_json(filename) -> dict[str, RuleInfo]:
        """create dict with target as key, which contains rules as value"""
        data = {}
        with open(filename) as f:
            json_rules = json.load(f)

        for item in json_rules["data"]:
            key = item["target"]
            source = item["source"]
            enforce = item["enforce"]
            comment = item["comment"]
            rule_info = RuleInfo(enforce, source, comment)

            if key in data:
                print(
                    f"ERR: Key {key} already present. Please clean the rules to ensure unique targets"
                )

            data[key] = rule_info

        return data

    @staticmethod
    def read_hrules_json(filename):
        data = {}
        with open(filename) as f:
            json_rules = json.load(f)

        for item in json_rules["data"]:
            key = item["target"]
            source = item["source"]
            enforce = item["enforce"]
            comment = item["comment"]
            rule_info = RuleInfo(enforce, source, comment)

            if key in data:
                print(
                    f"ERR: Key {key} already present. Please clean the rules to ensure unique targets"
                )

            data[key] = rule_info

        return data

    @staticmethod
    def merge_warning_list(
        old_warning_list: list[dict], new_warning_list: list[dict]
    ) -> list[dict]:
        merged_warning_list = []

        for old_warning in old_warning_list:
            if any(
                [
                    old_warning.get("description") == new_warning.get("description")
                    and old_warning.get("priority") == new_warning.get("priority")
                    for new_warning in new_warning_list
                ]
            ):
                merged_warning_list.append(old_warning)

        for new_warning in new_warning_list:
            if not any(
                [
                    old_warning.get("description") == new_warning.get("description")
                    and old_warning.get("priority") == new_warning.get("priority")
                    for old_warning in old_warning_list
                ]
            ):
                merged_warning_list.append(new_warning)

        return merged_warning_list
