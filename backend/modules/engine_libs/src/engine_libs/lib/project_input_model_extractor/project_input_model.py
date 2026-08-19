"""
Project Input Model

Core model class for managing project data extracted from questionnaires and architecture diagrams.
Provides data access, manipulation, and access control mapping functionality.
"""

import copy
import logging
from collections import defaultdict
from typing import Any

from engine_libs.config.runtime_config import (
    PROJECT_INPUT_MODEL_ANCESTOR_TRAVERSAL_MAX_STEPS,
)
from engine_libs.lib.bases import ModelSolverBase
from engine_libs.utils.data_extractor_util import DataExtractorUtil

from shared_libs.decorators import raise_exception
from shared_libs.protocols import OntologyModelProtocol

logger = logging.getLogger(__name__)


class ProjectInputModel(ModelSolverBase):
    """
    Core project model for managing extracted project data.

    Handles data storage, retrieval, manipulation, and access control mapping
    for project information derived from questionnaires and architecture diagrams.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    def __init__(self, ontology_model: OntologyModelProtocol) -> None:
        """
        Initialize the project input model.

        Args:
            ontology_model: The ontology model for semantic processing
        """
        self.ontology_model: OntologyModelProtocol = ontology_model
        self.filter_results: dict[str, list[Any]] = {}
        self.project_input_model_dict: dict[str, Any] = {}
        self.objlist: list[Any] = []
        self.reverse_mapping: dict[str, list[str]] = defaultdict(list)
        super().__init__(project_input_model=self)
        logger.debug(
            "[ RR-PROJECT-MODEL ] Project input model initialized successfully."
        )

    # ============================================================================
    # PUBLIC API METHODS
    # ============================================================================

    @raise_exception(
        "Failed to set project id.",
        exception_logger=logger,
    )
    def set_project_id(self, proj_id: str) -> None:
        """Set the project ID."""
        self.project_id = proj_id

    @raise_exception(
        "Failed to set new attribute.",
        exception_logger=logger,
    )
    def set_attribute(
        self,
        attribute_key: str,
        attribute_value: Any,
    ) -> None:
        """Set an attribute in the project model."""
        self.project_input_model.set(attribute_key, attribute_value)

    @raise_exception(
        "Failed to initialize project model.",
        exception_logger=logger,
    )
    def init_model(
        self,
        data: dict[str, Any],
    ) -> None:
        """Initialize the model with data."""
        self.project_input_model_dict = data

    @raise_exception(
        "Failed to get node data.",
        exception_logger=logger,
    )
    def get_node_data(
        self,
        node_id: str,
    ) -> dict[str, Any]:
        """Get data for a specific node by ID."""
        for node in self.project_input_model.get("dataflow.vertices"):
            if node_id == node["id"]:
                return node
        return {}

    # ============================================================================
    # DATA MANIPULATION METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute ProjectModel update().",
        exception_logger=logger,
    )
    def update(
        self,
        attribute_name: str,
        result: Any,
    ) -> None:
        """
        Update an attribute with new data.

        Args:
            attribute_name: The name of the attribute to update
            result: The new data to add to the attribute
        """
        obj = self.get(attribute_name)

        if isinstance(obj, list):
            self._update_list_attribute(obj, result)
        elif isinstance(obj, dict):
            self._update_dict_attribute(obj, result)
        else:
            self._replace_attribute_value(obj, result)

    @raise_exception(
        "Failed to execute ProjectModel set().",
        exception_logger=logger,
    )
    def set(
        self,
        attribute_name: str,
        result: Any,
    ) -> None:
        """
        Set an attribute value, supporting nested attributes.

        Args:
            attribute_name: The name of the attribute to set (supports dot notation)
            result: The value to set
        """
        if self._is_nested_attribute(attribute_name):
            self._set_nested_attribute(attribute_name, result)
        else:
            self._set_top_level_attribute(attribute_name, result)

    @raise_exception(
        "Failed to add ProjectModel properties.",
        exception_logger=logger,
    )
    def add_properties(
        self,
        dict_properties: dict[str, Any],
    ) -> None:
        """Add multiple properties to the model."""
        self.project_input_model_dict.update(dict_properties)

    @raise_exception(
        "Failed to execute ProjectModel get().",
        exception_logger=logger,
    )
    def get(
        self,
        attribute_name: str,
    ) -> Any:
        """Get an attribute value from the model."""
        return self.get_nested_value_with_references(
            self.project_input_model_dict,
            attribute_name,
        )

    @raise_exception(
        "Failed to execute ProjectModel get_object().",
        exception_logger=logger,
    )
    def get_object(
        self,
        ref_attribute_name: str,
        answer: Any,
    ) -> Any | None:
        """Get an object by reference attribute and answer value."""
        object_by_ref = self.get(ref_attribute_name)
        if object_by_ref:
            for obj in object_by_ref:
                if isinstance(obj, dict):
                    if obj["value"] == answer:
                        return answer
                if obj == answer:
                    return obj
        return None

    # ============================================================================
    # COMPLEX ATTRIBUTE METHODS
    # ============================================================================

    @raise_exception(
        "Failed to retrieve complex attributes.",
        exception_logger=logger,
    )
    def get_complex_attr(
        self,
        main_object: dict[str, Any],
        attr_name: str,
    ) -> list[dict[str, Any]] | None:
        """
        Get complex attributes like ancestorNode.

        Args:
            main_object: The main object to extract attributes from
            attr_name: The name of the complex attribute to extract

        Returns:
            List of ancestor nodes or None if attribute not supported
        """
        match attr_name:
            case "ancestorNode":
                return self._get_ancestor_nodes(main_object)
            case _:
                return None

    @raise_exception(
        "Failed to check for object ref.",
        exception_logger=logger,
    )
    def check_for_object_ref(
        self,
        main_object: dict[str, Any] | None,
    ) -> Any:
        """Check if object has reference and resolve it."""
        if (
            main_object is not None
            and "source" in main_object
            and len(main_object) == 2
        ):
            return self.get_object(main_object["source"], main_object["id"])
        else:
            return main_object

    @raise_exception(
        "Failed to check for attribute ref.",
        exception_logger=logger,
    )
    def check_for_attr_ref(
        self,
        main_object: dict[str, Any],
        attr_name: str,
    ) -> Any | None:
        """Check if attribute is a reference and resolve it."""
        if attr_name[0] == "{" and attr_name[-1] == "}":
            return self.get_complex_attr(main_object, attr_name[1:-1])
        else:
            if attr_name in main_object:
                return main_object[attr_name]
            return None

    @raise_exception(
        "Failed to retrieve nested value from structure.",
        exception_logger=logger,
    )
    def get_nested_value_with_references(
        self,
        structure: dict[str, Any],
        nested_address: str,
    ) -> Any:
        """Get nested value from structure using utility function with reference resolution."""
        return DataExtractorUtil.get_value_from_structure_recursive(
            structure,
            nested_address,
            retrieve_fn=self.check_for_object_ref,
            attr_fn=self.check_for_attr_ref,
        )

    # ============================================================================
    # EQUATION AND FILTER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to execute ProjectModel run_filter().",
        exception_logger=logger,
    )
    def run_filter(
        self,
        results_name: str,
        equation: str,
    ) -> None:
        """Run a filter equation and store results."""
        equation = "self." + equation
        if results_name not in self.filter_results:
            self.filter_results[results_name] = []
        evaluated_equation = eval(equation)
        for item in evaluated_equation:
            if item not in self.filter_results[results_name]:
                self.filter_results[results_name].append(item)

    @raise_exception(
        "Failed to execute ProjectModel run_equation().",
        exception_logger=logger,
    )
    def run_equation(
        self,
        equation: str,
        params: list[Any] | None = None,
    ) -> Any:
        """Run an equation with optional parameters."""
        equation = "self." + equation
        if params:
            self.objlist = params
        return eval(equation)

    # ============================================================================
    # ACCESS CONTROL MAPPING METHODS
    # ============================================================================

    @raise_exception(
        "Failed to complete access control mapping.",
        exception_logger=logger,
    )
    def complete_access_control_mapping(self) -> None:
        """
        Complete access control mapping by linking data to locations.

        Processes the access control mapping table and links data items to their
        storage locations in the dataflow vertices.
        """
        mapping = self._get_access_control_mapping()
        nodes_with_data = self._get_nodes_with_data_stored()

        if mapping and nodes_with_data:
            new_mapping = self._process_access_control_mapping(mapping, nodes_with_data)
            self.project_input_model.set("access_control_mapping.table", new_mapping)

        logger.info(
            "[ RR-PROJECT-MODEL ] Access control mapping completed successfully."
        )

    @raise_exception(
        "Failed to get_reverse_mapping.",
        exception_logger=logger,
    )
    def get_reverse_mapping(
        self,
        list_obj: dict[str, list[str]],
    ) -> None:
        """Create reverse mapping from data values to node names."""
        self.reverse_mapping = defaultdict(list)
        for key, values in list_obj.items():
            for value in values:
                self.reverse_mapping[value].append(key)

    @raise_exception(
        "Failed to find keys by value.",
        exception_logger=logger,
    )
    def find_keys_by_value(
        self,
        search_value: str,
    ) -> list[str] | None:
        """Find node names that store a specific data value."""
        return self.reverse_mapping.get(search_value, None)

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to update list attribute.",
        exception_logger=logger,
    )
    def _update_list_attribute(
        self,
        obj: list[Any],
        result: Any,
    ) -> None:
        """
        Update a list attribute by appending new data.

        Args:
            obj: The list object to update
            result: The data to append
        """
        obj.append(result)

    @raise_exception(
        "Failed to update dict attribute.",
        exception_logger=logger,
    )
    def _update_dict_attribute(
        self,
        obj: dict[str, Any],
        result: Any,
    ) -> None:
        """
        Update a dictionary attribute by merging new data.

        Args:
            obj: The dictionary object to update
            result: The data to merge (must be a dictionary)
        """
        if isinstance(result, dict):
            obj.update(result)

    @raise_exception(
        "Failed to replace attribute value.",
        exception_logger=logger,
    )
    def _replace_attribute_value(
        self,
        obj: Any,
        result: Any,
    ) -> None:
        """
        Replace the attribute value entirely.

        Args:
            obj: The current object (unused)
            result: The new value to set
        """
        # Note: This method doesn't actually replace the value in the original location
        # The caller should use set() method for complete replacement
        pass

    @raise_exception(
        "Failed to check if attribute is nested.",
        exception_logger=logger,
    )
    def _is_nested_attribute(
        self,
        attribute_name: str,
    ) -> bool:
        """
        Check if attribute name represents a nested attribute.

        Args:
            attribute_name: The attribute name to check

        Returns:
            True if attribute is nested (contains dots), False otherwise
        """
        return "." in attribute_name

    @raise_exception(
        "Failed to set nested attribute.",
        exception_logger=logger,
    )
    def _set_nested_attribute(
        self,
        attribute_name: str,
        result: Any,
    ) -> None:
        """
        Set a nested attribute value.

        Args:
            attribute_name: The nested attribute name (e.g., "parent.child")
            result: The value to set
        """
        nested_parts = attribute_name.split(".")
        parent_path = ".".join(nested_parts[:-1])
        child_key = nested_parts[-1]

        main_object = self.get(parent_path)
        main_object[child_key] = result

    @raise_exception(
        "Failed to set top-level attribute.",
        exception_logger=logger,
    )
    def _set_top_level_attribute(
        self,
        attribute_name: str,
        result: Any,
    ) -> None:
        """
        Set a top-level attribute value.

        Args:
            attribute_name: The attribute name
            result: The value to set
        """
        self.project_input_model_dict[attribute_name] = result

    def _get_ancestor_nodes(
        self,
        main_object: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """
        Get ancestor nodes by traversing parent relationships.

        Args:
            main_object: The starting object for ancestor traversal

        Returns:
            List of ancestor nodes including the starting object

        Raises:
            Exception: If loop ceiling is reached during traversal
        """
        obj = main_object
        ancestor_nodes = [obj]
        loop_count = 0

        while obj is not None:
            loop_count += 1
            if loop_count > PROJECT_INPUT_MODEL_ANCESTOR_TRAVERSAL_MAX_STEPS:
                raise Exception("Loop ceiling reached. Exiting ...")

            obj = self.get_nested_value_with_references(obj, "parentId")
            ancestor_nodes.append(obj)

        return ancestor_nodes

    @raise_exception(
        "Failed to get access control mapping.",
        exception_logger=logger,
    )
    def _get_access_control_mapping(self) -> list[dict[str, Any]] | None:
        """
        Get the access control mapping table from the project model.

        Returns:
            The access control mapping table or None if not found
        """
        return self.project_input_model.get("access_control_mapping.table")

    @raise_exception(
        "Failed to get nodes with data stored.",
        exception_logger=logger,
    )
    def _get_nodes_with_data_stored(self) -> dict[str, list[str]]:
        """
        Get nodes that store data from the dataflow vertices.

        Returns:
            Dictionary mapping node values to their stored data lists
        """
        vertices = self.project_input_model.get("dataflow.vertices")
        return {
            n["value"]: n["data_stored"]
            for n in vertices
            if n["data_stored"] is not None and n["data_stored"] != []
        }

    @raise_exception(
        "Failed to process access control mapping.",
        exception_logger=logger,
    )
    def _process_access_control_mapping(
        self,
        mapping: list[dict[str, Any]],
        nodes_with_data: dict[str, list[str]],
    ) -> list[dict[str, Any]]:
        """
        Process access control mapping by linking data to locations.

        Args:
            mapping: The access control mapping table
            nodes_with_data: Dictionary of nodes and their stored data

        Returns:
            Updated mapping with location information
        """
        self.get_reverse_mapping(nodes_with_data)
        new_mapping = []

        for mapping_item in mapping:
            locations = self.find_keys_by_value(mapping_item["data"])
            if locations:
                new_mapping.extend(
                    self._create_location_mappings(mapping_item, locations)
                )
            else:
                mapping_item["location"] = ""
                new_mapping.append(mapping_item)

        return new_mapping

    @raise_exception(
        "Failed to create location mappings.",
        exception_logger=logger,
    )
    def _create_location_mappings(
        self,
        mapping_item: dict[str, Any],
        locations: list[str],
    ) -> list[dict[str, Any]]:
        """
        Create location mappings for a data item.

        Args:
            mapping_item: The original mapping item
            locations: List of locations where data is stored

        Returns:
            List of mapping items with location information
        """
        location_mappings = []
        for location in locations:
            new_mapping_item = copy.deepcopy(mapping_item)
            new_mapping_item["location"] = location
            location_mappings.append(new_mapping_item)
        return location_mappings
