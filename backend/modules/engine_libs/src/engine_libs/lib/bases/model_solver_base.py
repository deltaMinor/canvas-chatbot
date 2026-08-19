"""
Model Solver for configuration-driven risk assessment system.

Provides expression evaluation and object matching functionality including attribute
comparisons, object validation, and complex nested object matching across multiple
JSON configuration files.
"""

import logging
from itertools import chain
from typing import TYPE_CHECKING, Any

from shared_libs.decorators import raise_exception
from shared_libs.protocols import OntologyModelProtocol

if TYPE_CHECKING:
    from shared_libs.protocols import ProjectInputModelProtocol

logger = logging.getLogger(__name__)


class ModelSolverBase:
    """Core evaluator for configuration-driven model rules.

    The solver provides reusable operators referenced by JSON rule definitions,
    including scalar/list comparisons, ontology-backed equivalence checks, nested
    object filtering, and helper lookups over project-input attributes.

    It is designed to support both:
    - direct boolean checks used by rule engines, and
    - tuple-returning query helpers that carry match context for downstream logic.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    @raise_exception(
        "Failed to initialize ModelSolverBase.",
        exception_logger=logger,
    )
    def __init__(self, project_input_model: "ProjectInputModelProtocol") -> None:
        """Initialize the model solver.

        Args:
            project_input_model: The project input model to work with.
        """
        logger.info("[ RR-PROJECT-MODEL ] Initializing ModelSolverBase")
        self.project_input_model: ProjectInputModelProtocol = project_input_model
        self.ontology_model: OntologyModelProtocol = project_input_model.ontology_model

    @raise_exception(
        "Failed to execute exists_value_equals_ont().",
        exception_logger=logger,
    )
    def exists_value_equals_ont_op(
        self,
        values: list[str],
        answer: str,
    ) -> bool:
        if not isinstance(values, list):
            return False
        for value in values:
            if self._check_value_equality(value, answer):
                return True
        return False

    @raise_exception(
        "Failed to execute equals_ont().",
        exception_logger=logger,
    )
    def equals_ont_op(
        self,
        value: str,
        required_answer: str,
    ) -> bool:
        return self._check_value_equality(value, required_answer)

    @raise_exception(
        "Failed to execute isin_ont().",
        exception_logger=logger,
    )
    def isin_ont_op(
        self,
        value: str,
        given_list: list[str],
    ) -> bool:
        return self._check_value_in_list(value, given_list)

    @raise_exception(
        "Failed to execute not_isin_ont().",
        exception_logger=logger,
    )
    def not_isin_ont_op(
        self,
        value: str,
        given_list: list[str],
    ) -> bool:
        return not self._check_value_in_list(value, given_list)

    @raise_exception(
        "Failed to execute isin_op_ont.",
        exception_logger=logger,
    )
    def isin_op_ont(
        self,
        value: str,
        list_answers: list[str],
        ont: OntologyModelProtocol,
    ) -> bool:
        logger.warning("isin_op_ont is deprecated, consider using isin_ont instead")
        for answer in list_answers:
            if ont.equals(value, answer):
                return True
        return False

    @raise_exception(
        "Failed to check value equality.",
        exception_logger=logger,
    )
    def _check_value_equality(
        self,
        value: str,
        answer: str,
    ) -> bool:
        return self.ontology_model.equals(value, answer)

    @raise_exception(
        "Failed to check value in list.",
        exception_logger=logger,
    )
    def _check_value_in_list(
        self,
        value: str,
        given_list: list[str],
    ) -> bool:
        for answer in given_list:
            if self._check_value_equality(value, answer):
                return True
        return False

    # # General rules function # #

    # ============================================================================
    # CONFIGURATION-DRIVEN METHODS (Called via multiple JSON configuration files)
    # ============================================================================

    @raise_exception(
        "Failed to execute equals_op.",
        exception_logger=logger,
    )
    def equals_op(self, value: Any, required_answer: Any) -> bool:
        """Check if value equals required answer.

        Args:
            value: The value to compare.
            required_answer: The required answer to match against.

        Returns:
            bool: True if values are equal, False otherwise.
        """
        if not value and required_answer == "None":
            return True
        else:
            return value == required_answer

    @raise_exception(
        "Failed to execute ProjectModel notequals_op().",
        exception_logger=logger,
    )
    def notequals_op(self, value: Any, required_answer: Any) -> bool:
        """Check if value does not equal required answer.

        Args:
            value: The value to compare.
            required_answer: The required answer to match against.

        Returns:
            bool: True if values are not equal, False otherwise.
        """
        if not value and required_answer == "None":
            return True
        else:
            return value != required_answer

    @raise_exception(
        "Failed to execute notin_op.",
        exception_logger=logger,
    )
    def notin_op(self, value: Any, list_answers: list[Any]) -> bool:
        """Check if value is not in list of answers.

        Args:
            value: The value to check.
            list_answers: List of answers to check against.

        Returns:
            bool: True if value is not in list, False otherwise.
        """
        return value not in list_answers

    @raise_exception(
        "Failed to execute object_equals_op.",
        exception_logger=logger,
    )
    def object_equals_op(self, obj1: dict[str, Any], obj2: dict[str, Any]) -> bool:
        """Check if two objects are equal by comparing their IDs.

        Args:
            obj1: First object to compare.
            obj2: Second object to compare.

        Returns:
            bool: True if objects have matching IDs, False otherwise.
        """
        if "id" in obj1 and "id" in obj2:
            return obj1["id"] == obj2["id"]
        else:
            return False

    @raise_exception(
        "Failed to execute object_equals_op.",
        exception_logger=logger,
    )
    def non_empty_list_op(self, value: list, match_functions: list) -> bool:
        """Check if list is non empty."""
        return bool(value)

    @raise_exception(
        "Failed to retrieve objects with attribute match.",
        exception_logger=logger,
    )
    def object_with_attribute_match(
        self, attribute_name: str, list_attribute_match_function: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Retrieve objects that match specified attribute conditions.

        Args:
            attribute_name: Name of the attribute to search in.
            list_attribute_match_function: List of match function configurations.

        Returns:
            List[Dict[str, Any]]: List of objects that match all specified conditions.
        """
        main_object = self.project_input_model.get(attribute_name) or []

        matching_objects = []

        for obj in main_object:
            if self._check_object_attribute_match(obj, list_attribute_match_function):
                matching_objects.append(obj)

        return matching_objects

    @raise_exception(
        "Failed to execute ProjectModel results_equation().",
        exception_logger=logger,
    )
    def results_equation(
        self, attribute_name: str, list_objects: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Process list of objects and return unique results based on attribute.

        Args:
            attribute_name: Name of the attribute to extract (or "None" for full object).
            list_objects: List of objects to process.

        Returns:
            List[Dict[str, Any]]: List of unique objects based on ID.
        """
        unique_results = {}

        for obj in list_objects:
            result = self._extract_object_attribute(obj, attribute_name)
            if result["id"] not in unique_results:
                unique_results[result["id"]] = result

        return list(unique_results.values())

    # ============================================================================
    # ATTRIBUTE COMPARISON METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute ProjectModel attribute_equals().",
        exception_logger=logger,
    )
    def attribute_equals(
        self, attribute_name: str, required_answer: Any
    ) -> tuple[bool, Any | None]:
        """Check if attribute equals required answer.

        Args:
            attribute_name: Name of the attribute to check.
            required_answer: The required answer to match against.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, attribute_value).
        """
        if attribute_name is None:
            return (False, None)

        main_attribute = self._get_main_attribute(attribute_name)
        return self.equals_op(main_attribute, required_answer), main_attribute

    @raise_exception(
        "Failed to execute ProjectModel attribute_isin().",
        exception_logger=logger,
    )
    def attribute_isin(
        self, attribute_name: str, list_accepted_answers: list[Any]
    ) -> tuple[bool, Any | None]:
        """Check if attribute value is in list of accepted answers.

        Args:
            attribute_name: Name of the attribute to check.
            list_accepted_answers: List of accepted answers.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, attribute_value).
        """
        if attribute_name is None or list_accepted_answers is None:
            return (False, None)

        main_attribute = self.project_input_model.get(attribute_name)
        return (
            self.isin_op(main_attribute, list_accepted_answers),
            main_attribute,
        )

    @raise_exception(
        "Failed to execute ProjectModel all_attribute_isin().",
        exception_logger=logger,
    )
    def all_attribute_isin(
        self, attribute_name: str, list_accepted_answers: list[Any]
    ) -> tuple[bool, Any | None]:
        """Check if attribute value is in list of accepted answers.

        Args:
            attribute_name: Name of the attribute to check.
            list_accepted_answers: List of accepted answers.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, attribute_value).
        """
        if attribute_name is None or list_accepted_answers is None:
            return (False, None)

        main_attribute = self._get_main_attribute(attribute_name)

        for value in list_accepted_answers:
            if value not in main_attribute:
                return (False, None)
        return (True, list_accepted_answers)

    @raise_exception(
        "Failed to execute ProjectModel attribute_notin_list().",
        exception_logger=logger,
    )
    def attribute_notin_list(
        self, attribute_name: str, list_rejected_answers: list[Any]
    ) -> tuple[bool, Any | None]:
        """Check if string answer is not in list of rejected answers.

        Args:
            attribute_name: Name of the attribute to check.
            list_rejected_answers: List of rejected answers.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, attribute_value).
        """
        if attribute_name is None:
            return (False, None)
        answer = self._get_main_attribute(attribute_name)
        if answer and answer not in list_rejected_answers:
            return True, answer

        return (False, None)

    @raise_exception(
        "Failed to execute ProjectModel list_any_attribute_isin().",
        exception_logger=logger,
    )
    def list_any_attribute_isin(
        self, attribute_name: str, list_accepted_answers: list[Any]
    ) -> tuple[bool, list[Any]]:
        """Check if any attribute in a list is in the list of accepted answers.

        Args:
            attribute_name: Name of the attribute list to check.
            list_accepted_answers: List of accepted answers.

        Returns:
            Tuple[bool, List[Any]]: Tuple of (match_result, matching_attributes).
        """
        if attribute_name is None or list_accepted_answers is None:
            return (False, [])

        main_attribute = self._get_main_attribute(attribute_name)
        matching_attributes = []

        if main_attribute is not None:
            matching_attributes = self._find_matching_attributes(
                main_attribute, list_accepted_answers
            )

        return (len(matching_attributes) > 0, matching_attributes)

    @raise_exception(
        "Failed to execute ProjectModel exists_attribute_notin().",
        exception_logger=logger,
    )
    def exists_attribute_notin(
        self, attribute_name: str, list_rejected_answers: list[Any]
    ) -> tuple[bool, Any | None]:
        """Check if any attribute value is not in list of rejected answers.

        Args:
            attribute_name: Name of the attribute to check.
            list_rejected_answers: List of rejected answers.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, matching_value).
        """
        if attribute_name is None:
            return (False, None)

        answers = self._get_main_attribute(attribute_name)
        return self._check_attribute_notin(answers, list_rejected_answers)

    # ============================================================================
    # OBJECT SEARCH METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute ProjectModel exists_object_with_name().",
        exception_logger=logger,
    )
    def exists_object_with_name(
        self, attribute_name: str, required_answer: Any
    ) -> tuple[bool, dict[str, Any] | None]:
        """Check if object with specific name exists in attribute list.

        Args:
            attribute_name: Name of the attribute containing object list.
            required_answer: Required name value to match.

        Returns:
            Tuple[bool, Optional[Dict[str, Any]]]: Tuple of (exists_result, matching_object).
        """
        if attribute_name is None:
            return (False, None)

        main_attribute = self.project_input_model.get(attribute_name)
        return self._find_object_by_name(main_attribute, required_answer)

    @raise_exception(
        "Failed to execute ProjectModel exists_object_with_name_isin().",
        exception_logger=logger,
    )
    def exists_object_with_name_isin(
        self, attribute_name: str, list_accepted_answers: list[Any]
    ) -> tuple[bool, dict[str, Any] | None]:
        """Check if object with name in accepted list exists in attribute list.

        Args:
            attribute_name: Name of the attribute containing object list.
            list_accepted_answers: List of accepted name values.

        Returns:
            Tuple[bool, Optional[Dict[str, Any]]]: Tuple of (exists_result, matching_object).
        """
        main_attribute = self.project_input_model.get(attribute_name)
        return self._find_object_by_name_in_list(main_attribute, list_accepted_answers)

    @raise_exception(
        "Failed to check if object exists with attribute match.",
        exception_logger=logger,
    )
    def exists_object_with_attribute_match(
        self,
        attribute_name: str,
        list_attribute_match_function: list[dict[str, Any]],
    ) -> tuple[bool, list[dict[str, Any]]]:
        """Check if objects exist that match specified attribute conditions.

        Args:
            attribute_name: Name of the attribute to search in.
            list_attribute_match_function: List of match function configurations.

        Returns:
            Tuple[bool, List[Dict[str, Any]]]: Tuple of (exists_result, matching_objects).
        """
        matching_objects = self.object_with_attribute_match(
            attribute_name,
            list_attribute_match_function,
        )
        return (len(matching_objects) > 0, matching_objects)

    # ============================================================================
    # MEMBERSHIP CHECK METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute isin_op.",
        exception_logger=logger,
    )
    def isin_op(self, value: Any, list_answers: list[Any]) -> bool:
        """Check if value is in list of answers.

        Args:
            value: The value to check.
            list_answers: List of answers to check against.

        Returns:
            bool: True if value is in list, False otherwise.
        """
        return value in list_answers

    @raise_exception(
        "Failed to execute list_any_isin_op.",
        exception_logger=logger,
    )
    def list_any_isin_op(self, list_value: list[Any], list_answers: list[Any]) -> bool:
        """Check if any value in list_value is in list of answers.

        Args:
            value: The value to check.
            list_answers: List of answers to check against.

        Returns:
            bool: True if value is in list, False otherwise.
        """
        return len(self._find_matching_attributes(list_value, list_answers)) > 0

    @raise_exception(
        "Failed to execute exists_common_in_lists.",
        exception_logger=logger,
    )
    def exists_common_value_in_lists(
        self, attribute: str, list_answers: list[Any]
    ) -> tuple[bool, list[Any]]:
        """Check if any value in list_value is in list of answers.

        Args:
            value: The value to check.
            list_answers: List of answers to check against.

        Returns:
            bool: True if value is in list, False otherwise.
        """
        main_attribute = self.project_input_model.get(attribute)
        if not main_attribute:
            return (False, [])
        result = self._find_matching_attributes(main_attribute, list_answers)
        if len(result):
            return (True, result)
        return (False, [])

    @raise_exception(
        "Failed to execute object_isin_op.",
        exception_logger=logger,
    )
    def object_isin_op(
        self, obj: dict[str, Any], obj_list: list[dict[str, Any]]
    ) -> bool:
        """Check if object is in list of objects by ID comparison.

        Args:
            obj: Object to check.
            obj_list: List of objects to check against.

        Returns:
            bool: True if object ID is found in list, False otherwise.
        """
        return self._check_object_in_list_by_id(obj, obj_list)

    @raise_exception(
        "Failed to execute exists_object_isin_op.",
        exception_logger=logger,
    )
    def exists_object_isin_op(
        self,
        obj: dict[str, Any] | list[dict[str, Any]],
        obj_list: list[dict[str, Any]],
    ) -> bool:
        """Check if any object from obj exists in obj_list by ID comparison.

        Args:
            obj: Object or list of objects to check.
            obj_list: List of objects to check against.

        Returns:
            bool: True if any object ID is found in list, False otherwise.
        """
        if obj is None:
            return False

        obj_ids = [o["id"] for o in obj_list]
        objects_to_check = self._normalize_object_input(obj)

        return self._check_objects_exist_in_list(objects_to_check, obj_ids)

    @raise_exception(
        "Failed to execute userstory_attribute_match_isin_op().",
        exception_logger=logger,
    )
    def userstory_attribute_match_isin_op(
        self,
        card_id: str,
        list_attribute_match_function: list[dict[str, Any]],
    ) -> tuple[bool, dict[str, Any] | None]:
        matching_objects = self.object_with_attribute_match(
            attribute_name="user_stories",
            list_attribute_match_function=list_attribute_match_function,
        )
        for matching_object in matching_objects:
            if matching_object["id"] == card_id:
                return (True, matching_object)
        return (False, None)

    @raise_exception(
        "Failed to check if data_stored object exists with attribute match.",
        exception_logger=logger,
    )
    def data_stored_attribute_match_isin(
        self,
        given_object_list: list[dict[str, Any]] | None,
        list_attribute_match_function: list[dict[str, Any]],
    ) -> tuple[bool, list[dict[str, Any]]]:
        """Check if objects exist that match specified attribute conditions.

        Args:
            attribute_name: Name of the attribute to search in.
            list_attribute_match_function: List of match function configurations.

        Returns:
            Tuple[bool, List[Dict[str, Any]]]: Tuple of (exists_result, matching_objects).
        """

        if (
            given_object_list is None
            or not isinstance(list_attribute_match_function, list)
            or not len(list_attribute_match_function)
        ):
            return (False, [])

        matching_objects = self.object_with_attribute_match(
            attribute_name="data",
            list_attribute_match_function=list_attribute_match_function,
        )

        given_object_list_values = [obj.get("value") for obj in given_object_list]

        result = []

        for obj in matching_objects:
            if obj.get("value") in given_object_list_values:
                result.append(obj)

        return (len(result) > 0, result)

    @raise_exception(
        "Failed to check if data_stored object exists with attribute match.",
        exception_logger=logger,
    )
    def is_non_empty_list(
        self,
        given_object_list: list[dict[str, Any]] | None,
        _list_of_functions: Any,
    ) -> tuple[bool, list[dict[str, Any]]]:
        """Check if list is not empty.

        Args:
            given_object_list: Name of the attribute to search in.
            _list_of_functions: List of match function configurations.

        Returns:
            Tuple[bool, List[Dict[str, Any]]]: Tuple of (exists_result, matching_objects).
        """
        if not given_object_list:
            return (False, [])

        return (True, given_object_list)

    # ============================================================================
    # SPECIALIZED OPERATION METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute exist_permissions_op.",
        exception_logger=logger,
    )
    def exist_permissions_op(
        self, obj_list: list[dict[str, Any]], user: str, permission: str
    ) -> bool:
        """Check if user has specific permission in any object's access rights.

        Args:
            obj_list: List of objects with access_rights.
            user: User to check permissions for.
            permission: Permission to check for.

        Returns:
            bool: True if user has permission in any object, False otherwise.
        """
        return self._check_user_permissions(obj_list, user, permission)

    @raise_exception(
        "Failed to execute is_object_match_in_list.",
        exception_logger=logger,
    )
    def is_object_match_in_list_op(
        self, obj_list: list[dict[str, Any]], required_answer: dict[str, Any]
    ) -> bool:
        """Check if any object in list matches all required answer criteria.

        Args:
            obj_list: List of objects to check.
            required_answer: Dictionary of required key-value pairs.

        Returns:
            bool: True if any object matches all criteria, False otherwise.
        """
        if not required_answer or not obj_list:
            return False

        return self._find_matching_object_in_list(obj_list, required_answer)

    @raise_exception(
        "Failed to execute exists_key_in_object_given_value().",
        exception_logger=logger,
    )
    def exists_key_in_object_given_value(
        self, attribute_name: str, required_value: Any
    ) -> tuple[bool, str | None]:
        """Find key in object that has the required value.

        Args:
            attribute_name: Name of the attribute containing the object.
            required_value: Value to search for.

        Returns:
            Tuple[bool, Optional[str]]: Tuple of (found_result, key_name).
        """
        if attribute_name is None or required_value is None:
            return (False, None)

        main_attribute = self.project_input_model.get(attribute_name)
        return self._find_key_by_value(main_attribute, required_value)

    def given_object_with_attribute_match_op(
        self, obj: dict[str, Any], match_functions: list[dict[str, Any]]
    ) -> bool:
        return self._check_object_attribute_match(obj, match_functions)

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to check object attribute match.",
        exception_logger=logger,
    )
    def _check_object_attribute_match(
        self, obj: dict[str, Any], match_functions: list[dict[str, Any]]
    ) -> bool:
        """Check if object matches all attribute match functions.

        Args:
            obj: Object to check.
            match_functions: List of match function configurations.

        Returns:
            bool: True if object matches all functions, False otherwise.
        """
        for match_function in match_functions:
            attribute_value = self._extract_attribute_value(obj, match_function)
            list_answers = self._get_match_parameters(match_function)

            if not self._evaluate_match_function(
                match_function, attribute_value, list_answers
            ):
                return False

        return True

    @raise_exception(
        "Failed to extract attribute value.",
        exception_logger=logger,
    )
    def _extract_attribute_value(
        self, obj: dict[str, Any], match_function: dict[str, Any]
    ) -> Any:
        """Extract attribute value from object using match function configuration.

        Args:
            obj: Object to extract from.
            match_function: Match function configuration.

        Returns:
            Any: Extracted attribute value.
        """
        return self.project_input_model.get_nested_value_with_references(
            obj, match_function["attribute"]
        )

    @raise_exception(
        "Failed to get match parameters.",
        exception_logger=logger,
    )
    def _get_match_parameters(self, match_function: dict[str, Any]) -> Any:
        """Get parameters for match function based on parameter type.

        Args:
            match_function: Match function configuration.

        Returns:
            Any: Parameters for the match function.
        """
        match match_function["parameter_type"]:
            case "string":
                return match_function["parameters"]
            case "list":
                return match_function["parameters"]
            case "filter":
                return self.project_input_model.filter_results[
                    match_function["parameters"][0]
                ]
            case "set":
                return self.project_input_model.get(match_function["parameters"])

    @raise_exception(
        "Failed to evaluate match function.",
        exception_logger=logger,
    )
    def _evaluate_match_function(
        self, match_function: dict[str, Any], attribute_value: Any, list_answers: Any
    ) -> bool:
        """Evaluate match function with given parameters.

        Args:
            match_function: Match function configuration.
            attribute_value: Attribute value to check.
            list_answers: Parameters for the function.

        Returns:
            bool: Result of the match function evaluation.
        """
        expression = "self." + match_function["expression"]
        return eval(f"{expression}(attribute_value, list_answers)")

    @raise_exception(
        "Failed to extract object attribute.",
        exception_logger=logger,
    )
    def _extract_object_attribute(
        self, obj: dict[str, Any], attribute_name: str
    ) -> dict[str, Any]:
        """Extract attribute from object or return full object.

        Args:
            obj: Object to extract from.
            attribute_name: Name of attribute to extract (or "None" for full object).

        Returns:
            Dict[str, Any]: Extracted attribute or full object.
        """
        if attribute_name != "None":
            return self.project_input_model.get_nested_value_with_references(
                obj, attribute_name
            )
        return obj

    @raise_exception(
        "Failed to find matching attributes.",
        exception_logger=logger,
    )
    def _find_matching_attributes(
        self, main_attribute: list[Any], list_accepted_answers: list[Any]
    ) -> list[Any]:
        """Find attributes that are in the accepted answers list.

        Args:
            main_attribute: List of attributes to check.
            list_accepted_answers: List of accepted answers.

        Returns:
            List[Any]: List of matching attributes.
        """
        matching_attributes = []
        for attr in main_attribute:
            if self.isin_op(attr, list_accepted_answers):
                matching_attributes.append(attr)
        return matching_attributes

    @raise_exception(
        "Failed to check attribute notin.",
        exception_logger=logger,
    )
    def _check_attribute_notin(
        self, answers: Any | list[Any], list_rejected_answers: list[Any]
    ) -> tuple[bool, Any | None]:
        """Check if any answer is not in rejected list.

        Args:
            answers: Answer or list of answers to check.
            list_rejected_answers: List of rejected answers.

        Returns:
            Tuple[bool, Optional[Any]]: Tuple of (match_result, matching_value).
        """
        if isinstance(answers, list):
            for answer in answers:
                if answer not in list_rejected_answers:
                    return (True, answer)
            return (False, None)
        else:
            return (answers not in list_rejected_answers, answers)

    @raise_exception(
        "Failed to find object by name.",
        exception_logger=logger,
    )
    def _find_object_by_name(
        self, main_attribute: list[dict[str, Any]] | None, required_answer: Any
    ) -> tuple[bool, dict[str, Any] | None]:
        """Find object with specific name in attribute list.

        Args:
            main_attribute: List of objects to search.
            required_answer: Required name value.

        Returns:
            Tuple[bool, Optional[Dict[str, Any]]]: Tuple of (found_result, matching_object).
        """
        if main_attribute:
            for obj in main_attribute:
                if self.equals_op(obj["name"], required_answer):
                    return (True, obj)
        return (False, None)

    @raise_exception(
        "Failed to find object by name in list.",
        exception_logger=logger,
    )
    def _find_object_by_name_in_list(
        self,
        main_attribute: list[dict[str, Any]] | None,
        list_accepted_answers: list[Any],
    ) -> tuple[bool, dict[str, Any] | None]:
        """Find object with name in accepted list.

        Args:
            main_attribute: List of objects to search.
            list_accepted_answers: List of accepted name values.

        Returns:
            Tuple[bool, Optional[Dict[str, Any]]]: Tuple of (found_result, matching_object).
        """
        if main_attribute:
            for obj in main_attribute:
                if self.isin_op(obj["name"], list_accepted_answers):
                    return (True, obj)
        return (False, None)

    @raise_exception(
        "Failed to check object in list by ID.",
        exception_logger=logger,
    )
    def _check_object_in_list_by_id(
        self, obj: dict[str, Any], obj_list: list[dict[str, Any]]
    ) -> bool:
        """Check if object ID exists in object list.

        Args:
            obj: Object to check.
            obj_list: List of objects to check against.

        Returns:
            bool: True if object ID found, False otherwise.
        """
        for obj2 in obj_list:
            if obj["id"] == obj2["id"]:
                return True
        return False

    @raise_exception(
        "Failed to normalize object input.",
        exception_logger=logger,
    )
    def _normalize_object_input(self, obj: Any) -> list[dict[str, Any]]:
        """Coerce *obj* to ``list[dict]``.

        The canonical shape is ``list[dict]``.  Single-dict and nested-list
        inputs are legacy caller shapes — a warning is emitted for each so
        the root cause can be found and corrected.

        Args:
            obj: Expected to be ``list[dict]``.  Single dict and nested lists
                are accepted with a warning.

        Returns:
            Flat ``list[dict]`` ready for further processing.
        """
        if isinstance(obj, list):
            if any(isinstance(el, list) for el in obj):
                logger.warning(
                    "_normalize_object_input: received nested list instead of"
                    " flat list[dict]. Caller should flatten before passing."
                )
                flattened = list(chain.from_iterable(obj))
                return [item for item in flattened if isinstance(item, dict)]
            return [item for item in obj if isinstance(item, dict)]
        if isinstance(obj, dict):
            logger.warning(
                "_normalize_object_input: received a single dict instead of"
                " list[dict]. Caller should wrap in a list."
            )
            return [obj]
        logger.warning(
            "_normalize_object_input: unexpected type %s — returning [].",
            type(obj).__name__,
        )
        return []

    @raise_exception(
        "Failed to check objects exist in list.",
        exception_logger=logger,
    )
    def _check_objects_exist_in_list(
        self, objects_to_check: list[dict[str, Any]], obj_ids: list[str]
    ) -> bool:
        """Check if any object ID exists in the ID list.

        Args:
            objects_to_check: List of objects to check.
            obj_ids: List of object IDs to check against.

        Returns:
            bool: True if any object ID found, False otherwise.
        """
        for obj in objects_to_check:
            if obj["id"] in obj_ids:
                return True
        return False

    @raise_exception(
        "Failed to check user permissions.",
        exception_logger=logger,
    )
    def _check_user_permissions(
        self, obj_list: list[dict[str, Any]], user: str, permission: str
    ) -> bool:
        """Check if user has permission in any object's access rights.

        Args:
            obj_list: List of objects with access_rights.
            user: User to check.
            permission: Permission to check for.

        Returns:
            bool: True if user has permission, False otherwise.
        """
        for obj in obj_list:
            for rights in obj["access_rights"]:
                if rights["user"] == user and permission in rights["permissions"]:
                    return True
        return False

    @raise_exception(
        "Failed to find matching object in list.",
        exception_logger=logger,
    )
    def _find_matching_object_in_list(
        self, obj_list: list[dict[str, Any]], required_answer: dict[str, Any]
    ) -> bool:
        """Find object that matches all required criteria.

        Args:
            obj_list: List of objects to check.
            required_answer: Dictionary of required key-value pairs.

        Returns:
            bool: True if matching object found, False otherwise.
        """
        for obj in obj_list:
            if self._check_object_matches_criteria(obj, required_answer):
                return True
        return False

    @raise_exception(
        "Failed to check object matches criteria.",
        exception_logger=logger,
    )
    def _check_object_matches_criteria(
        self, obj: dict[str, Any], required_answer: dict[str, Any]
    ) -> bool:
        """Check if object matches all required criteria.

        Args:
            obj: Object to check.
            required_answer: Dictionary of required key-value pairs.

        Returns:
            bool: True if object matches all criteria, False otherwise.
        """
        for key, req_value in required_answer.items():
            if key not in obj:
                return False

            obj_value = obj[key]
            if isinstance(req_value, list):
                if obj_value not in req_value:
                    return False
            else:
                if obj_value != req_value:
                    return False
        return True

    @raise_exception(
        "Failed to find key by value.",
        exception_logger=logger,
    )
    def _find_key_by_value(
        self, main_attribute: dict[str, Any] | None, required_value: Any
    ) -> tuple[bool, str | None]:
        """Find key in object that has the required value.

        Args:
            main_attribute: Object to search in.
            required_value: Value to search for.

        Returns:
            Tuple[bool, Optional[str]]: Tuple of (found_result, key_name).
        """
        if main_attribute is None or not isinstance(main_attribute, dict):
            return (False, None)

        for key, value in main_attribute.items():
            if self.equals_op(value, required_value):
                return (True, key)
        return (False, None)

    @raise_exception(
        "Failed to find object by dynamic reference.",
        exception_logger=logger,
    )
    def _find_object_by_dynamic_reference(
        self,
        main_attribute: list[dict[str, Any]],
        questionnaire_ref: dict[str, str],
        required_value: str,
    ) -> tuple[bool, str | None]:
        """Find object with dynamic value reference matching required value.

        Args:
            main_attribute: List of objects to search.
            questionnaire_ref: Reference mapping for dynamic values.
            required_value: Required value to match.

        Returns:
            Tuple[bool, Optional[str]]: Tuple of (found_result, matching_value).
        """
        for obj in main_attribute:
            obj_value = obj.get("value", None)
            if not obj_value:
                continue

            obj_name = questionnaire_ref.get(obj_value, None)
            if obj_name == required_value:
                return (True, required_value)
        return (False, None)

    @raise_exception(
        "Failed to get main attribute by attribute name.",
        exception_logger=logger,
    )
    def _get_main_attribute(self, attribute_name: str) -> Any | None:
        main_attribute = self.project_input_model.get(attribute_name)

        if not main_attribute:
            return None

        # list of objects, objects has following keys: ['label', 'value' and 'domain' keys]
        if (
            isinstance(main_attribute, list)
            and len(main_attribute) > 0
            and all(isinstance(item, dict) for item in main_attribute)
        ):
            dict_items = [item for item in main_attribute if isinstance(item, dict)]
            if dict_items and all(
                "value" in item and "label" in item for item in dict_items
            ):
                main_attribute = [item["value"] for item in dict_items]

        return main_attribute
