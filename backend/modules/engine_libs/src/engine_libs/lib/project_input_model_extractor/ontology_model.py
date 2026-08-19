"""
Ontology Model

Manages ontology operations for semantic processing and class hierarchy evaluation.
Provides functionality for subclass retrieval, class label processing, and equality evaluation.
"""

import logging
from typing import TYPE_CHECKING

from shared_libs.decorators import raise_exception

if TYPE_CHECKING:
    from shared_libs.protocols import OntologyProtocol

logger = logging.getLogger(__name__)


class OntologyModel:
    """
    Manages ontology operations for semantic processing and class hierarchy evaluation.

    Provides functionality for subclass retrieval, class label processing, and equality
    evaluation between values and ontology classes.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    @raise_exception(
        "Failed to initialize OntologyModel.",
        exception_logger=logger,
    )
    def __init__(
        self,
        ontology: "OntologyProtocol",
    ) -> None:
        """
        Initialize the ontology model with an ontology instance.

        Args:
            ontology: The loaded ontology instance
        """

        try:
            self.onto: OntologyProtocol = ontology
            self.individual_names: list[str] = self._extract_individual_names()
            logger.info(
                f"[ RR-PROJECT-MODEL ] Successfully loaded ontology with {len(self.individual_names)} individuals"
            )
        except Exception as e:
            logger.error(f"Failed loading ontology: {e}")
            raise

    # ============================================================================
    # PUBLIC API METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute equals.",
        exception_logger=logger,
    )
    def equals(
        self,
        value: str,
        target_class_label: str,
    ) -> bool:
        """
        Check if a value equals a target class label.

        Args:
            value: The value to compare
            target_class_label: The target class label to compare against

        Returns:
            True if value equals target class label, False otherwise
        """
        is_equal = self._eval_equals(value, target_class_label)
        return is_equal

    # ============================================================================
    # EQUALITY EVALUATION METHODS
    # ============================================================================

    @raise_exception(
        "Failed to evaluate equals function.",
        exception_logger=logger,
    )
    def _eval_equals(
        self,
        value: str,
        target_class_label: str,
    ) -> bool:
        """
        Evaluate if a value equals a target class label considering ontology hierarchy.

        Args:
            value: The value to compare
            target_class_label: The target class label to compare against

        Returns:
            True if value equals target class label, False otherwise
        """
        # Handle None/empty value cases
        if self._is_none_value_case(value, target_class_label):
            return True
        if not value:
            return False

        # Direct equality check
        if value == target_class_label:
            return True

        # Get subclass information
        subclass_labels = self._get_subclass_labels(target_class_label)

        # Check if value is an individual
        if value in self.individual_names:
            return self._check_individual_equality(
                value, target_class_label, subclass_labels
            )
        else:
            # Check if value is in subclass labels
            result = value in subclass_labels
            return result

    @raise_exception(
        "Failed to check None value case.",
        exception_logger=logger,
    )
    def _is_none_value_case(
        self,
        value: str,
        target_class_label: str,
    ) -> bool:
        """
        Check if this is a None value case.

        Args:
            value: The value to check
            target_class_label: The target class label

        Returns:
            True if this is a None value case
        """
        return not value and target_class_label == "None"

    # ============================================================================
    # ONTOLOGY DATA EXTRACTION METHODS
    # ============================================================================

    @raise_exception(
        "Failed to extract individual names.",
        exception_logger=logger,
    )
    def _extract_individual_names(self) -> list[str]:
        """
        Extract individual names from the ontology.

        Returns:
            List of individual names as strings
        """
        return [str(_.name) for _ in self.onto.individuals()]

    # ============================================================================
    # CLASS HIERARCHY OPERATIONS
    # ============================================================================

    @raise_exception(
        "Failed to get all subclasses.",
        exception_logger=logger,
    )
    def _get_all_subclasses(
        self,
        class_name: str,
    ) -> list[str]:
        """
        Get all subclasses of a given class name.

        Args:
            class_name: The name of the class to find subclasses for

        Returns:
            List of subclass names as strings
        """
        if not class_name:
            return []

        try:
            subclass_of = self.onto[class_name]
            subclasses = self.onto.search(subclass_of=subclass_of)
            subclass_names = [str(a) for a in subclasses]
            return subclass_names
        except Exception as e:
            logger.warning(f"No subclasses found for class {class_name}: {e}")
            return []

    @raise_exception(
        "Failed to retrieve class labels.",
        exception_logger=logger,
    )
    def _get_class_labels(
        self,
        class_address: str,
    ) -> str:
        """
        Extract clean class label from class address.

        Args:
            class_address: The full class address string

        Returns:
            Clean class label without ontology file path
        """
        try:
            class_address = str(class_address)
            class_address_parts = class_address.strip().split("tosca-builtins.xml", 1)

            if len(class_address_parts) > 1:
                clean_label = class_address_parts[1].lstrip(r".\/")
                return clean_label
            else:
                return class_address_parts[0]
        except Exception as e:
            logger.warning(f"Failed to retrieve class labels for {class_address}: {e}")
            return class_address

    @raise_exception(
        "Failed to get subclass labels.",
        exception_logger=logger,
    )
    def _get_subclass_labels(
        self,
        target_class_label: str,
    ) -> list[str]:
        """
        Get all subclass labels for a target class.

        Args:
            target_class_label: The target class label

        Returns:
            List of subclass labels
        """
        all_subclass_addresses = [
            str(_) for _ in self._get_all_subclasses(target_class_label)
        ]
        all_subclass_labels = [
            self._get_class_labels(_) for _ in all_subclass_addresses
        ]
        return all_subclass_labels

    # ============================================================================
    # INDIVIDUAL PROCESSING METHODS
    # ============================================================================

    @raise_exception(
        "Failed to check individual equality.",
        exception_logger=logger,
    )
    def _check_individual_equality(
        self,
        value: str,
        target_class_label: str,
        subclass_labels: list[str],
    ) -> bool:
        """
        Check equality for individual values.

        Args:
            value: The individual value
            target_class_label: The target class label
            subclass_labels: List of subclass labels

        Returns:
            True if individual matches target class or subclasses
        """
        individual = self._find_individual_by_name(value)
        if not individual:
            logger.warning(f"Cannot find individual with name {value}")
            return False

        individual_class_labels = self._get_individual_class_labels(individual)

        # Check direct class match
        if target_class_label in individual_class_labels:
            return True

        # Check subclass match
        for individual_class_label in individual_class_labels:
            if individual_class_label in subclass_labels:
                return True

        return False

    @raise_exception(
        "Failed to find individual by name.",
        exception_logger=logger,
    )
    def _find_individual_by_name(
        self,
        value: str,
    ) -> object | None:
        """
        Find an individual by its name.

        Args:
            value: The individual name to search for

        Returns:
            The individual object if found, None otherwise
        """
        return next(
            (_ for _ in self.onto.individuals() if str(_.name) == value),
            None,
        )

    @raise_exception(
        "Failed to get individual class labels.",
        exception_logger=logger,
    )
    def _get_individual_class_labels(
        self,
        individual: object,
    ) -> list[str]:
        """
        Get class labels for an individual.

        Args:
            individual: The individual object

        Returns:
            List of class labels for the individual
        """
        individual_class_addresses = [str(_) for _ in individual.is_a]
        individual_class_labels = [
            self._get_class_labels(_) for _ in individual_class_addresses
        ]
        return individual_class_labels
