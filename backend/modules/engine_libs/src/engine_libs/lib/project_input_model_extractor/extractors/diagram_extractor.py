"""
Diagram Extractor

Handles extraction and processing of diagram data from architecture diagrams.
Provides functionality for graph traversal, entity initialization, and diagram processing.
"""

import logging
from itertools import chain
from typing import TYPE_CHECKING, Any

from engine_libs.config.runtime_config import DIAGRAM_GRAPH_TRAVERSAL_MAX_STEPS
from engine_libs.lib.bases import ModelExtractorBase

from shared_libs.decorators import raise_exception

if TYPE_CHECKING:
    from shared_libs.protocols import ProjectInputModelProtocol

logger = logging.getLogger(__name__)


class DiagramExtractor(ModelExtractorBase):
    """
    Handles extraction and processing of diagram data from architecture diagrams.

    Provides functionality for graph traversal, entity initialization, diagram processing,
    and complex traversal operations with stop conditions and second-pass processing.
    """

    # ============================================================================
    # INITIALIZATION
    # ============================================================================

    @raise_exception(
        "Failed to initialize DiagramExtractor.",
        exception_logger=logger,
    )
    def __init__(
        self,
        project_input_model: "ProjectInputModelProtocol",
    ) -> None:
        """
        Initialize the diagram extractor instance.

        Args:
            project_input_model: The project input model to work with
        """
        self.project_input_model: ProjectInputModelProtocol = project_input_model
        super().__init__(project_input_model=project_input_model)
        logger.debug("[ RR-PROJECT-MODEL ] Diagram extractor initialized successfully.")

    # ============================================================================
    # PUBLIC API METHODS
    # ============================================================================

    @raise_exception(
        "Failed to initialize diagrams.",
        exception_logger=logger,
    )
    def init_diagrams(
        self,
        diagram: dict[str, Any],
        extraction_logic: list[dict[str, Any]],
    ) -> None:
        """
        Initialize diagrams with extraction logic.

        Args:
            diagram: The diagram data to process
            extraction_logic: The extraction logic configuration
        """
        self.diagram = diagram
        self.data = self._get_data()
        self._extract_diagram(extraction_logic)
        logger.debug(
            "[ RR-PROJECT-MODEL ] Diagram initialization completed successfully"
        )

    # ============================================================================
    # CONFIGURATION-DRIVEN METHODS (Called via kb_question_to_model.json)
    # ============================================================================

    @raise_exception(
        "Failed to traverse graph structure.",
        exception_logger=logger,
    )
    def traverse_graph_structure(
        self,
        this_vertex: Any,
        vertex_attr_traversal: str,
        stop_condition: dict[str, Any],
    ) -> list[Any]:
        """
        Traverse graph structure until stop condition is satisfied.

        Called externally through configuration-driven system (kb_question_to_model.json).
        Used in diagram second-pass processing for boundary detection.

        Args:
            this_vertex: The starting vertex
            vertex_attr_traversal: The attribute to traverse
            stop_condition: The stop condition configuration

        Returns:
            List of traversed objects
        """
        list_traversed_objects = []
        current_vertex = this_vertex

        # Traverse the graph structure until the stop condition is satisfied or when you can't
        # traverse any more
        loop_count = 0
        while not self._run_condition_equation(
            stop_condition["expression"],
            current_vertex[stop_condition["attribute"]],
            stop_condition["parameters"][0],
        ):
            loop_count += 1
            if loop_count > DIAGRAM_GRAPH_TRAVERSAL_MAX_STEPS:
                raise Exception("Loop ceiling reached. Exiting ...")
            # Move to the next vertex by using the vertex's attribute "vertex_attr_traversal" value
            current_vertex = self.project_input_model.get_nested_value_with_references(
                current_vertex, vertex_attr_traversal
            )

            if not current_vertex or len(current_vertex) == 0:
                break

            list_traversed_objects.append(current_vertex)

        # return all the objects that were traversed
        return list_traversed_objects

    @raise_exception(
        "Failed to traverse iterate.",
        exception_logger=logger,
    )
    def traverse_iterate(
        self,
        this_object: Any,
        model_attr: str,
        stop_condition: dict[str, Any],
    ) -> list[Any]:
        """
        Iterate through objects and add to list if stop condition is satisfied.

        Called externally through configuration-driven system (kb_question_to_model.json).
        Used in diagram second-pass processing for data storage relationships.

        Args:
            this_object: The object to process
            model_attr: The model attribute to iterate through
            stop_condition: The stop condition configuration

        Returns:
            List of traversed objects
        """
        list_traversed_objects = []

        list_objects = self.project_input_model.get(model_attr)
        # Iterate through all the objects in project_input_model[model_attr] and add to list if stop
        # condition is satisfied
        for obj in list_objects:
            if self._run_condition_equation(
                stop_condition["expression"],
                obj[stop_condition["attribute"]],
                this_object,
            ):
                list_traversed_objects.append(obj)

        # Return all the objects that were traversed
        return list_traversed_objects

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to extract diagram.",
        exception_logger=logger,
    )
    def _extract_diagram(
        self,
        extraction_logic: list[dict[str, Any]],
    ) -> None:
        """
        Extract diagram data using the provided extraction logic.

        Args:
            extraction_logic: The extraction logic configuration
        """
        for new_diagram in extraction_logic:
            new_diagram_name = new_diagram["diagramAttribute"]
            proj_diagram = {}

            # Initialize the vertices objects
            self._init_graph_entities(new_diagram, "nodes", proj_diagram)
            self.project_input_model.set(new_diagram_name, proj_diagram)

            # Initialize the edges objects
            self._init_graph_entities(new_diagram, "edges", proj_diagram)
            self.project_input_model.set(new_diagram_name, proj_diagram)

            # Do a second pass on the vertices objects to instantiate more properties
            if "secondPass" in new_diagram["nodes"]:
                nodes_attr_name = (
                    new_diagram_name
                    + "."
                    + new_diagram["nodes"]["toModel"]["topLevelAttribute"]
                )
                self._do_second_pass_on_diagram(
                    new_diagram["nodes"]["secondPass"], nodes_attr_name
                )

            # Do a second pass on the edges objects to instantiate more properties
            if "secondPass" in new_diagram["edges"]:
                edges_attr_name = (
                    new_diagram_name
                    + "."
                    + new_diagram["edges"]["toModel"]["topLevelAttribute"]
                )
                self._do_second_pass_on_diagram(
                    new_diagram["edges"]["secondPass"], edges_attr_name
                )

    @raise_exception(
        "Failed to get data in Diagram Extractor.",
        exception_logger=logger,
    )
    def _get_data(self) -> dict[str, list[Any]]:
        """
        Get processed diagram data from canvas.

        Returns:
            Dictionary containing nodes and edges from all canvases
        """
        src = self.diagram

        nodes = []
        edges = []
        for canvas in src["canvas"]:
            nodes.extend(canvas["nodes"])
            edges.extend(canvas["edges"])
        _canvas = {"nodes": nodes, "edges": edges}

        return _canvas

    @raise_exception(
        "Failed to run traversal equation.",
        exception_logger=logger,
    )
    def _run_traversal_equation(
        self,
        function: str,
        node: Any,
        attribute: str,
        stop_condition: dict[str, Any],
    ) -> Any:
        """
        Run a traversal equation with the given function and parameters.

        Args:
            function: The function name to execute
            node: The node to process
            attribute: The attribute to traverse
            stop_condition: The stop condition configuration

        Returns:
            Result of the function execution
        """
        return eval("self." + function + "(node, attribute, stop_condition)")

    @raise_exception(
        "Failed to run condition equation.",
        exception_logger=logger,
    )
    def _run_condition_equation(
        self,
        function: str,
        answer: Any,
        parameters: Any | None = None,
    ) -> Any:
        """
        Run a condition equation with the given function and parameters.

        Args:
            function: The function name to execute
            answer: The answer data to process
            parameters: Optional parameters for the function

        Returns:
            Result of the function execution
        """
        if not parameters:
            return eval(f"self.{function}(answer)")
        return eval(f"self.{function}(answer,parameters)")

    @raise_exception(
        "Failed to initialize graph entities.",
        exception_logger=logger,
    )
    def _init_graph_entities(
        self,
        diagram_extraction: dict[str, Any],
        entity_name: str,
        diagram_struct: dict[str, Any],
    ) -> None:
        """
        Initialize graph entities (nodes or edges) based on extraction logic.

        Args:
            diagram_extraction: The diagram extraction configuration
            entity_name: The entity name (nodes or edges)
            diagram_struct: The diagram structure to populate
        """
        entity_extraction = diagram_extraction[entity_name]
        answer_id = entity_extraction["fieldID"]
        entity_attr_name = entity_extraction["toModel"]["topLevelAttribute"]
        extraction_logic = entity_extraction["toModel"]

        entities = self.get_answer(self.data, answer_id)

        if not entities:
            diagram_struct[entity_attr_name] = None
            return

        if any(isinstance(el, list) for el in entities):
            all_entities = list(chain.from_iterable(entities))
        else:
            all_entities = entities

        result, checks = self.run_extraction_logic(extraction_logic, all_entities)

        diagram_struct[entity_attr_name] = result

    @raise_exception(
        "Failed to traverse objects.",
        exception_logger=logger,
    )
    def _traverse_objects(
        self,
        this_object: Any,
        traversal_defn: dict[str, Any],
    ) -> list[Any]:
        """
        Traverse objects starting from this_object using traversal definition.

        Args:
            this_object: The starting object
            traversal_defn: The traversal definition configuration

        Returns:
            List of traversed objects
        """
        list_traversed_objects = [this_object]

        if len(traversal_defn) > 0:
            traversal_expression = traversal_defn["expression"]

            objects_traversed = self._run_traversal_equation(
                traversal_expression,
                this_object,
                traversal_defn["attribute"],
                traversal_defn["stop_condition"],
            )

            list_traversed_objects.extend(objects_traversed)

        return list_traversed_objects

    @raise_exception(
        "Failed to do second pass on diagram.",
        exception_logger=logger,
    )
    def _do_second_pass_on_diagram(
        self,
        extraction_logic: list[dict[str, Any]],
        diagram_component_name: str,
    ) -> None:
        """
        Perform second pass processing on diagram components.

        Args:
            extraction_logic: The extraction logic configuration
            diagram_component_name: The name of the diagram component
        """
        for second_extraction in extraction_logic:
            all_components = self.project_input_model.get(diagram_component_name)
            if not all_components:
                continue

            self._process_second_pass_extraction(second_extraction, all_components)

    @raise_exception(
        "Failed to get specific object.",
        exception_logger=logger,
    )
    def _get_specific_object(
        self,
        object_type_name: str,
        list_objects: list[Any],
    ) -> Any:
        """
        Get specific object from list based on type name.

        Args:
            object_type_name: The type name of the object to retrieve
            list_objects: The list of objects to search in

        Returns:
            The specific object based on type name
        """
        match object_type_name:
            case "this_object":
                return list_objects[0]
            case "last_object":
                return list_objects[-1]
            case "all_object":
                return list_objects[1:]

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    @raise_exception(
        "Failed to process second pass extraction.",
        exception_logger=logger,
    )
    def _process_second_pass_extraction(
        self,
        second_extraction: dict[str, Any],
        all_components: list[Any],
    ) -> None:
        """
        Process a single second pass extraction.

        Args:
            second_extraction: The second pass extraction configuration
            all_components: The list of components to process
        """
        extraction_condition = second_extraction["condition"]

        for comp in all_components:
            if self._should_process_component(comp, extraction_condition):
                self._execute_second_pass_action(comp, second_extraction)

    @raise_exception(
        "Failed to check if component should be processed.",
        exception_logger=logger,
    )
    def _should_process_component(
        self,
        comp: Any,
        extraction_condition: dict[str, Any],
    ) -> bool:
        """
        Check if a component should be processed based on extraction condition.

        Args:
            comp: The component to check
            extraction_condition: The extraction condition configuration

        Returns:
            True if component should be processed, False otherwise
        """
        _answer = (
            comp[extraction_condition["attribute"]]
            if extraction_condition["attribute"] in comp
            else None
        )

        if not _answer:
            return False

        return self._run_condition_equation(
            extraction_condition["expression"],
            _answer,
            extraction_condition["parameters"][0],
        )

    @raise_exception(
        "Failed to execute second pass action.",
        exception_logger=logger,
    )
    def _execute_second_pass_action(
        self,
        comp: Any,
        second_extraction: dict[str, Any],
    ) -> None:
        """
        Execute the second pass action on a component.

        Args:
            comp: The component to process
            second_extraction: The second pass extraction configuration
        """
        # Do traversal
        traversal_extraction = second_extraction["traversal"]
        list_traversed_objects = self._traverse_objects(comp, traversal_extraction)

        # Run equation
        action_extraction = second_extraction["action"]

        # Get answer and modification objects
        answer_obj = self._get_specific_object(
            action_extraction["answers"]["target_object"],
            list_traversed_objects,
        )

        mod_obj = self._get_specific_object(
            action_extraction["target_modify"]["traverse_object"],
            list_traversed_objects,
        )

        # Process modification object
        mod_obj = self._process_modification_object(
            mod_obj, action_extraction["target_modify"]["object_attr"]
        )

        # Collect answers
        answer_collection = self._collect_answers(
            answer_obj, action_extraction["answers"]["target_object_attr"]
        )

        # Create new attribute value
        new_attribute_value = self._create_new_attribute_value(
            action_extraction["toModel"], answer_collection
        )

        # Modify target object
        self._modify_target_object(
            mod_obj,
            action_extraction["toModel"]["topLevelAttribute"],
            new_attribute_value,
        )

    @raise_exception(
        "Failed to process modification object.",
        exception_logger=logger,
    )
    def _process_modification_object(
        self,
        mod_obj: Any,
        mod_obj_attr: str | None,
    ) -> Any:
        """
        Process modification object based on object attribute.

        Args:
            mod_obj: The modification object
            mod_obj_attr: The object attribute to process

        Returns:
            The processed modification object
        """
        if mod_obj_attr is not None:
            if isinstance(mod_obj, list):
                target_mod_obj = []
                for obj in mod_obj:
                    target_mod_obj.append(
                        self.project_input_model.get_nested_value_with_references(
                            obj, mod_obj_attr
                        )
                    )
                return target_mod_obj
            else:
                return self.project_input_model.get_nested_value_with_references(
                    mod_obj, mod_obj_attr
                )
        return mod_obj

    @raise_exception(
        "Failed to collect answers.",
        exception_logger=logger,
    )
    def _collect_answers(
        self,
        answer_obj: Any,
        target_object_attr: str,
    ) -> Any:
        """
        Collect answers from answer object based on target object attribute.

        Args:
            answer_obj: The answer object
            target_object_attr: The target object attribute

        Returns:
            The collected answers
        """
        if answer_obj is not None and len(answer_obj) > 0:
            if isinstance(answer_obj, list):
                return [
                    self.project_input_model.get_nested_value_with_references(
                        obj, target_object_attr
                    )
                    for obj in answer_obj
                ]
            else:
                return self.project_input_model.get_nested_value_with_references(
                    answer_obj, target_object_attr
                )
        return None

    @raise_exception(
        "Failed to create new attribute value.",
        exception_logger=logger,
    )
    def _create_new_attribute_value(
        self,
        to_model: dict[str, Any],
        answer_collection: Any,
    ) -> Any:
        """
        Create new attribute value using creation equation.

        Args:
            to_model: The to model configuration
            answer_collection: The collected answers

        Returns:
            The new attribute value
        """
        if "parameters" in to_model:
            return self.run_creation_equation(
                to_model["function"],
                answer_collection,
                to_model["parameters"],
            )
        else:
            return self.run_creation_equation(
                to_model["function"],
                answer_collection,
            )

    @raise_exception(
        "Failed to modify target object.",
        exception_logger=logger,
    )
    def _modify_target_object(
        self,
        mod_obj: Any,
        new_attribute: str,
        new_attribute_value: Any,
    ) -> None:
        """
        Modify target object with new attribute value.

        Args:
            mod_obj: The modification object
            new_attribute: The new attribute name
            new_attribute_value: The new attribute value
        """
        if isinstance(mod_obj, list):
            for obj in mod_obj:
                self._set_object_attribute(obj, new_attribute, new_attribute_value)
        else:
            self._set_object_attribute(mod_obj, new_attribute, new_attribute_value)

    @raise_exception(
        "Failed to set object attribute.",
        exception_logger=logger,
    )
    def _set_object_attribute(
        self,
        obj: Any,
        new_attribute: str,
        new_attribute_value: Any,
    ) -> None:
        """
        Set object attribute with new value.

        Args:
            obj: The object to modify
            new_attribute: The new attribute name
            new_attribute_value: The new attribute value
        """
        # If the creation function starts with 'append', that means we should
        # just append to the target object(s) not overwrite it
        if "append" in new_attribute:
            if new_attribute not in obj:
                obj[new_attribute] = []
            obj[new_attribute].append(new_attribute_value)
        else:
            obj[new_attribute] = new_attribute_value
