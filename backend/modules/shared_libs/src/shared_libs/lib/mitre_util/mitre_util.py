"""Attack utility class for processing and formatting mitre documentation.

This module provides the main MitreUtil class that coordinates attack
documentation processing, formatting, and organization.
"""

import logging
from collections import defaultdict
from functools import cached_property
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.models.mitre import AttackPattern

logger = logging.getLogger(__name__)


class MitreUtil:
    """Utility class for processing and formatting mitre documentation.

    This class provides methods to format, parse, and extract information from
    mitre documentation across multiple domains (ICS, mobile, enterprise, atlas).
    It coordinates formatting, object extraction, scenario generation, and parsing.

    Attributes:
        mitre_docs_model: AttackDocsModel instance containing all attack
            documentation organized by domain and type.
    """

    def __init__(self, mitre_docs: list[AttackPattern]) -> None:
        """Initialize the MitreUtil instance.

        Args:
            mitre_docs_dict: Dictionary containing mitre documentation organized
                by document type. Should contain keys matching AttackDocType enum
                values with lists of mitre documents as values.

        Raises:
            Exception: If the mitre documentation dictionary is invalid or
                cannot be processed.
        """
        logger.info("[ SHARED-LIB ] Initializing mitre utils ...")
        self.mitre_docs = mitre_docs

    @cached_property
    @raise_exception(
        "Failed to retrieve mitre_parsed_docs.",
        exception_logger=logger,
    )
    def mitre_parsed_docs(self) -> dict[str, Any]:
        """Retrieve parsed mitre documentation.

        Returns:
            Dictionary containing parsed mitre documentation organized by
            object type and domain.

        Raises:
            Exception: If retrieval of parsed mitre documentation fails.
        """

        logger.info("[ SHARED-LIB ] Rebuilding property mitre_parsed_docs ...")
        mitre_docs_model = [AttackPattern(**_) for _ in self.mitre_docs]

        def kebab_to_camel(s) -> str:
            parts = s.split("-")
            return parts[0] + "".join(word.capitalize() for word in parts[1:])

        all_types = list(set([i.type for i in mitre_docs_model]))
        type_mappings = {k: kebab_to_camel(k) for k in all_types}

        data = defaultdict(list)
        for mitre_object in mitre_docs_model:
            data[type_mappings[mitre_object.type]].append(mitre_object.model_dump())

        return data
