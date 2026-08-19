"""Single-responsibility loader for TOSCA and SODALITE ontologies.

This is the **only** module in the codebase that imports
``TOSCA_BUILTINS_XML`` or ``SODALITE_METAMODEL_XML`` from
``engine_libs.config.path_config``.  All consumers that previously imported
those constants directly must go through this class instead.

Why ``onto_path`` registration is required
------------------------------------------
``owlready2.onto_path`` is the library's equivalent of Python's ``sys.path``.
When loading an ontology file, owlready2 encounters ``owl:imports`` declarations
that reference other ontology URIs.  It resolves those imports by searching
``onto_path`` for matching local files.  Without registering ``ONTOLOGY_DIR``
here, owlready2 would fail to find the sub-files that ``TOSCA_BUILTINS_XML``
depends on.

The registration is idempotent: the guard ``if path not in onto_path`` ensures
the directory is appended at most once even when the loader is instantiated
multiple times in the same process.

``PREDEFINED_ONTOLOGIES`` serves the same purpose for owlready2's URL-based
import resolution: it maps the canonical Sodalite IRI to a local file path so
``owl:imports <https://www.sodalite.eu/...>`` statements resolve locally.
"""

import logging
from typing import Any

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class ToscaOntologyLoader:
    """Load TOSCA and SODALITE ontologies via owlready2.

    Centralises all owlready2 path-registration side effects
    (``onto_path`` and ``PREDEFINED_ONTOLOGIES``) so they happen in
    one explicit place instead of being scattered across callers.

    Two load strategies are exposed to match the two existing call sites:

    * :meth:`load_for_extractor` — used by ``ProjectInputModelExtractor``
      (via ``file://`` URI, returns the ontology object directly).
    * :meth:`load_for_validator` — used by ``ToscaEdgeValidator``
      (wraps the owlready2 call with retry and logging).
    """

    def _register_search_paths(self) -> None:
        """Register ontology directories with owlready2 before any load.

        * Appends ``ONTOLOGY_DIR`` to ``onto_path`` so that ``owl:imports``
          declarations inside the TOSCA ontology can be resolved locally.
        * Registers the Sodalite IRI in ``PREDEFINED_ONTOLOGIES`` so that
          URL-based import statements map to the local SODALITE file.

        Both operations are idempotent.
        """
        from engine_libs.config.path_config import (
            ONTOLOGY_DIR,
            SODALITE_METAMODEL_XML,
        )
        from owlready2 import PREDEFINED_ONTOLOGIES, onto_path

        ontology_dir_str = str(ONTOLOGY_DIR)
        if ontology_dir_str not in onto_path:
            onto_path.append(ontology_dir_str)
            logger.debug(
                "[ TOSCA ] Registered ontology directory on onto_path: %s",
                ontology_dir_str,
            )

        sodalite_iri = "https://www.sodalite.eu/ontologies/sodalite-metamodel/"
        sodalite_file = str(SODALITE_METAMODEL_XML)
        if PREDEFINED_ONTOLOGIES.get(sodalite_iri) != sodalite_file:
            PREDEFINED_ONTOLOGIES[sodalite_iri] = sodalite_file
            logger.debug(
                "[ TOSCA ] Registered SODALITE IRI in PREDEFINED_ONTOLOGIES: %s",
                sodalite_file,
            )

    @raise_exception(
        "Failed to load TOSCA ontology for extractor.",
        exception_logger=logger,
    )
    def load_for_extractor(self, *, max_tries: int = 3) -> Any:
        """Load the TOSCA ontology for use by ``ProjectInputModelExtractor``.

        Registers search paths then loads via ``file://`` URI with retry.

        Args:
            max_tries: Number of load attempts before raising.

        Returns:
            The loaded owlready2 ontology object.

        Raises:
            Exception: If the ontology fails to load after *max_tries* attempts.
        """
        from engine_libs.config.path_config import TOSCA_BUILTINS_XML
        from owlready2 import get_ontology

        self._register_search_paths()

        ontology_file = str(TOSCA_BUILTINS_XML)
        last_exc: Exception | None = None
        for attempt in range(1, max_tries + 1):
            try:
                onto = get_ontology(f"file://{ontology_file}")
                result = onto.load(only_local=True)
                logger.info(
                    "[ TOSCA ] Ontology loaded on attempt %d: %s",
                    attempt,
                    ontology_file,
                )
                return result
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "[ TOSCA ] Ontology load attempt %d/%d failed: %s",
                    attempt,
                    max_tries,
                    exc,
                )

        raise Exception(
            f"Failed to load ontology after {max_tries} attempts"
        ) from last_exc

    @raise_exception(
        "Failed to load TOSCA ontology for validator.",
        exception_logger=logger,
    )
    def load_for_validator(self) -> Any:
        """Load the TOSCA ontology for use by ``ToscaEdgeValidator``.

        Registers search paths then loads via ``ToscaValidatorUtil`` which
        wraps owlready2 with retry logic and structured logging.

        Returns:
            The loaded owlready2 ``Ontology`` object.
        """
        from engine_libs.config.path_config import TOSCA_BUILTINS_XML

        self._register_search_paths()
        return self._read_ontology_file(str(TOSCA_BUILTINS_XML))

    # ------------------------------------------------------------------
    # Public facade — callers use these instead of ToscaValidatorUtil
    # ------------------------------------------------------------------

    @staticmethod
    def _read_ontology_file(ontology_file: str) -> Any:
        """Internal: load an ontology file via ToscaValidatorUtil."""
        from engine_libs.lib.tosca_ontology_loader.tosca_validator_util import (
            ToscaValidatorUtil,
        )

        return ToscaValidatorUtil.read_ontology_file(ontology_file)

    @staticmethod
    def read_rules_json(filename: str) -> dict:
        """Read edge validation rules from a JSON file.

        Args:
            filename: Absolute path to the rules JSON file.

        Returns:
            Dict mapping target tosca_type → ``RuleInfo``.
        """
        from engine_libs.lib.tosca_ontology_loader.tosca_validator_util import (
            ToscaValidatorUtil,
        )

        return ToscaValidatorUtil.read_rules_json(filename)

    @staticmethod
    def read_hrules_json(filename: str) -> dict:
        """Read hierarchy validation rules from a JSON file.

        Args:
            filename: Absolute path to the hierarchy rules JSON file.

        Returns:
            Dict mapping target tosca_type → ``RuleInfo``.
        """
        from engine_libs.lib.tosca_ontology_loader.tosca_validator_util import (
            ToscaValidatorUtil,
        )

        return ToscaValidatorUtil.read_hrules_json(filename)

    @staticmethod
    def merge_warning_list(
        old_warning_list: list[dict],
        new_warning_list: list[dict],
    ) -> list[dict]:
        """Merge two ``EdgeValidityInfo``/``HierarchyValidityInfo`` warning lists.

        Uses the old list as the baseline — if a warning appears in both, the
        older timestamp is preserved (i.e. ``old_warning_list`` wins on ties).

        Args:
            old_warning_list: Previous list of validity-info dicts.
            new_warning_list: New list of validity-info dicts.

        Returns:
            Merged list with no duplicates by (description, priority).
        """
        from engine_libs.lib.tosca_ontology_loader.tosca_validator_util import (
            ToscaValidatorUtil,
        )

        return ToscaValidatorUtil.merge_warning_list(old_warning_list, new_warning_list)
