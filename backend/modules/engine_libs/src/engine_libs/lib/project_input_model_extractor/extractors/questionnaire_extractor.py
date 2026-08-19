"""
Questionnaire Extractor

Extracts and processes questionnaire responses to populate project input models.
Handles both direct questionnaire extraction and reference mapping for dynamic content.
"""

import logging
from typing import Any

from engine_libs.lib.bases import ModelExtractorBase

from shared_libs.decorators import raise_exception
from shared_libs.protocols import ProjectInputModelProtocol

logger = logging.getLogger(__name__)


class QuestionnaireExtractor(ModelExtractorBase):
    """
    Extracts questionnaire responses and maps them to project model attributes.

    Processes questionnaire data through extraction logic to populate the project
    input model with structured information from user responses.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    def __init__(self, project_input_model: ProjectInputModelProtocol) -> None:
        """
        Initialize the questionnaire extractor.

        Args:
            project_input_model: The project model to populate with extracted data
        """
        self.project_input_model: ProjectInputModelProtocol = project_input_model
        self.questionnaire: dict[str, Any] = {}
        self.data: list[dict[str, Any]] = []
        super().__init__(project_input_model=project_input_model)
        logger.debug(
            "[ RR-PROJECT-MODEL ] Questionnaire extractor initialized successfully."
        )

    # ============================================================================
    # PUBLIC API METHODS
    # ============================================================================

    @raise_exception(
        "Failed to initialize questionnaire.",
        exception_logger=logger,
    )
    def init_questionnaire(
        self,
        questionnaire: dict[str, Any],
        extraction_logic: list[dict[str, Any]],
    ) -> None:
        """
        Initialize questionnaire processing with data and extraction logic.

        Args:
            questionnaire: The questionnaire data containing responses
            extraction_logic: The logic for mapping questions to model attributes
        """
        self.questionnaire = questionnaire
        self.data = self._get_questionnaire_data()

        self.project_input_model.set_project_id(self.questionnaire["project_id"])

        self._extract_questionnaire_responses(extraction_logic)
        self._extract_questionnaire_references(extraction_logic)
        logger.debug(
            "[ RR-PROJECT-MODEL ] Questionnaire initialization completed successfully"
        )

    @raise_exception(
        "Failed to extract answer from structure.",
        exception_logger=logger,
    )
    def get_answer_from_structure(
        self,
        answers: str | dict[str, Any] | list[Any],
    ) -> str | list[Any] | None:
        """
        Extract answer value from various answer structures.

        This method overrides the get_answer_from_structure method defined in the
        ModelExtractorBase superclass to provide enhanced answer extraction functionality
        with improved error handling and logging.

        Args:
            answers: The answer structure (string, dict, or list)

        Returns:
            Extracted answer value or None if invalid
        """
        if not answers or answers == "":
            return None

        if isinstance(answers, dict):
            return self._extract_from_dict_answer(answers)
        elif isinstance(answers, list):
            return self._extract_from_list_answer(answers)
        else:
            return answers

    # ============================================================================
    # QUESTIONNAIRE PROCESSING METHODS
    # ============================================================================

    @raise_exception(
        "Failed to extract questionnaire.",
        exception_logger=logger,
    )
    def _extract_questionnaire_responses(
        self,
        extraction_logic: list[dict[str, Any]],
    ) -> None:
        """
        Extract questionnaire responses and map them to model attributes.

        Args:
            extraction_logic: The logic for mapping questions to model attributes
        """
        for question in extraction_logic:
            question_id = question["questionId"]
            answer = self._get_answer_by_question_id(question_id)
            attribute_name = question["toModel"]["topLevelAttribute"]

            result, checks = self.run_extraction_logic(question["toModel"], answer)

            action = self._should_update_attribute(checks)
            if action == "update":
                self.project_input_model.update(attribute_name, result)
            elif action == "set":
                self.project_input_model.set(attribute_name, result)

    @raise_exception(
        "Failed to extract questionnaire ref.",
        exception_logger=logger,
    )
    def _extract_questionnaire_references(
        self,
        extraction_logic: list[dict[str, Any]],
    ) -> None:
        """
        Extract questionnaire references for dynamic content mapping.

        Args:
            extraction_logic: The logic for mapping questions to model attributes
        """
        questionnaire_ref = {}

        for question in extraction_logic:
            question_id = question["questionId"]
            answer = self.get_raw_answer(self.data, question_id)

            if isinstance(answer, dict):
                questionnaire_ref.update(self._extract_dict_reference(answer))
            elif isinstance(answer, list):
                questionnaire_ref.update(self._extract_list_references(answer))

        self.project_input_model.set("questionnaire_ref", questionnaire_ref)

    # ============================================================================
    # REFERENCE EXTRACTION METHODS
    # ============================================================================

    @raise_exception(
        "Failed to extract dictionary reference.",
        exception_logger=logger,
    )
    def _extract_dict_reference(
        self,
        answer: dict[str, Any],
    ) -> dict[str, str]:
        """
        Extract reference from a dictionary answer.

        Args:
            answer: Dictionary containing label and value

        Returns:
            Dictionary mapping value to label
        """
        if "label" in answer and "value" in answer:
            return {answer["value"]: answer["label"]}
        return {}

    @raise_exception(
        "Failed to extract list references.",
        exception_logger=logger,
    )
    def _extract_list_references(
        self,
        answer: list[dict[str, Any]],
    ) -> dict[str, str]:
        """
        Extract references from a list of answers.

        Args:
            answer: List of answer dictionaries

        Returns:
            Dictionary mapping values to labels
        """
        references = {}

        for list_ans in answer:
            if "card_id" in list_ans or "row_id" in list_ans:
                dynamic_ref = self._extract_dynamic_reference(list_ans)
                references.update(dynamic_ref)
            elif "label" in list_ans and "value" in list_ans:
                references[list_ans["value"]] = list_ans["label"]

        return references

    @raise_exception(
        "Failed to extract dynamic questionnaire ref.",
        exception_logger=logger,
    )
    def _extract_dynamic_reference(
        self,
        answer: dict[str, Any],
    ) -> dict[str, str]:
        """
        Extract dynamic references from complex answer structures.

        Args:
            answer: Dictionary containing dynamic reference data

        Returns:
            Dictionary mapping values to labels
        """
        result = {}

        for _key, value in answer.items():
            if isinstance(value, dict):
                self._extract_from_dict(value, result)
            elif isinstance(value, list):
                self._extract_from_list(value, result)

        return result

    @raise_exception(
        "Failed to extract from dictionary.",
        exception_logger=logger,
    )
    def _extract_from_dict(
        self,
        value: dict[str, Any],
        result: dict[str, str],
    ) -> None:
        """
        Extract references from a dictionary value and add to result.

        Args:
            value: Dictionary containing reference data
            result: Dictionary to add extracted references to
        """
        if "label" in value and "value" in value:
            result[value["value"]] = value["label"]
        else:
            for _key, inner_value in value.items():
                if isinstance(inner_value, dict):
                    self._extract_from_dict(value=inner_value, result=result)

    @raise_exception(
        "Failed to extract from list.",
        exception_logger=logger,
    )
    def _extract_from_list(
        self,
        value: list[Any],
        result: dict[str, str],
    ) -> None:
        """
        Extract references from a list value and add to result.

        Args:
            value: List containing reference data
            result: Dictionary to add extracted references to
        """
        for item in value:
            if isinstance(item, dict):
                if "label" in item and "value" in item:
                    result[item["value"]] = item["label"]
                else:
                    for _key, inner_value in item.items():
                        if isinstance(inner_value, dict):
                            self._extract_from_dict(value=inner_value, result=result)
                        elif isinstance(inner_value, list):
                            self._extract_from_list(value=inner_value, result=result)

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to get questionnaire data.",
        exception_logger=logger,
    )
    def _get_questionnaire_data(self) -> list[dict[str, Any]]:
        """
        Get questionnaire data from the questionnaire values.

        Extracts the submitted questionnaire values from the questionnaire data structure.
        The questionnaire is expected to contain a 'values' field with the actual response data.

        Returns:
            List[Dict[str, Any]]: List of questionnaire response dictionaries containing
                the submitted values from the questionnaire form.

        Raises:
            KeyError: If the questionnaire does not contain a 'values' field.
            ValueError: If the questionnaire values are empty or invalid.
            Exception: If any other error occurs during data extraction.
        """
        # Validate questionnaire structure
        if not self.questionnaire:
            raise ValueError("Questionnaire data is not available")

        # Extract values from questionnaire
        if "values" not in self.questionnaire:
            raise KeyError("Questionnaire does not contain 'values' field")

        submitted_version = self.questionnaire["values"]

        # Validate that values are not empty
        if not submitted_version or len(submitted_version) == 0:
            raise ValueError("Questionnaire values cannot be empty")

        return submitted_version

    @raise_exception(
        "Failed to determine attribute update strategy.",
        exception_logger=logger,
    )
    def _should_update_attribute(
        self,
        checks: dict[str, Any],
    ) -> bool:
        """
        Determine if attribute should be updated based on prerequisite checks.

        Args:
            checks: The extraction checks containing prerequisite information

        Returns:
            True if attribute should be updated, False if it should be set
        """
        is_pre_req = checks.get("is_pre_req", False)
        is_pre_req_check = checks.get("is_pre_req_check", False)
        if not is_pre_req:
            return "set"
        if is_pre_req_check:
            return "update"
        return None

    @raise_exception(
        "Failed to get answer by question ID.",
        exception_logger=logger,
    )
    def _get_answer_by_question_id(
        self,
        question_id: str,
    ) -> Any:
        """
        Get the answer for a specific question ID from questionnaire data.

        Args:
            question_id: The ID of the question to retrieve answer for

        Returns:
            The answer for the specified question
        """
        return self.get_answer(self.data, question_id)

    @raise_exception(
        "Failed to extract from dictionary answer.",
        exception_logger=logger,
    )
    def _extract_from_dict_answer(
        self,
        answers: dict[str, Any],
    ) -> str | None:
        """
        Extract value from dictionary answer.

        Args:
            answers: Dictionary containing answer data

        Returns:
            The value if found, None otherwise
        """
        if answers and "value" in answers:
            return answers["value"]
        return None

    @raise_exception(
        "Failed to extract from list answer.",
        exception_logger=logger,
    )
    def _extract_from_list_answer(
        self,
        answers: list[Any],
    ) -> list[Any] | None:
        """
        Extract values from list answer.

        Args:
            answers: List containing answer data

        Returns:
            List of values or original list
        """
        if not answers:
            return None

        if (
            isinstance(answers[0], dict)
            and "value" in answers[0]
            and len(answers[0]) == 2
        ):
            return [answer["value"] for answer in answers]
        else:
            return answers
