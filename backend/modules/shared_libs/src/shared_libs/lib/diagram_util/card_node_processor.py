import copy
import logging
from collections import defaultdict

from shared_libs.constants.diagram import (
    DATA_FLOW_DEVICE_NODE_TOSCA_TYPE,
    DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE,
    DATA_FLOW_USER_NODE_TOSCA_TYPE,
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    DEFAULT_NODE,
    MAX_HEIGHT_CLUSTER_NODE,
    MAX_WIDTH_CLUSTER_NODE,
    MIN_HEIGHT_CLUSTER_NODE,
    MIN_WIDTH_CLUSTER_NODE,
)
from shared_libs.decorators import raise_exception
from shared_libs.exceptions.api_exceptions import InternalServerError
from shared_libs.models.base_models import (
    CanvasBaseModel,
    CanvasCardNodeBaseModel,
    CanvasNodeBaseModel,
)
from shared_libs.models.database_models import KbToscaModel, ProjectADModel
from shared_libs.types.enum import (
    CanvasNodeVariantType,
    CanvasType,
    CardFieldId,
    Position,
)

from .card_node_builder import CardNodeBuilder
from .diagram_canvas_factory import DiagramCanvasFactory

DATA_FLOW_INTERFACE_NODE_ICON = "forums"
DATA_FLOW_DEVICE_NODE_ICON = "client"
DATA_FLOW_USER_NODE_ICON = "user"

logger = logging.getLogger(__name__)


class CardNodeProcessor:
    """Synchronize questionnaire card data into project diagram card nodes.

    The processor treats user story cards from the submitted questionnaire as
    the source of truth for data-flow canvases. It rebuilds card-node metadata,
    removes stale card-driven nodes and canvases, creates missing data-flow
    canvases, refreshes each canvas card reference, and keeps architecture
    canvas references aligned with the data-flow views.

    Hidden data-flow nodes are derived from card users, devices, interfaces,
    and data entries. Existing nodes keep their IDs and placement when possible
    so user layout work survives questionnaire updates.
    """

    def __init__(
        self,
        values: dict,
        project_ad_model: "ProjectADModel",
        kb_tosca_model: "KbToscaModel",
    ):
        """Create a processor for one project diagram update.

        Args:
            values: Submitted questionnaire values containing user story cards.
            project_ad_model: Project architecture diagram model to mutate.
            kb_tosca_model: TOSCA knowledge-base model used for schema and
                mapping metadata on generated data-flow nodes.
        """
        self.project_ad_model = project_ad_model
        self.card_node_builder = CardNodeBuilder(
            values=values,
            project_ad_model=project_ad_model,
        )
        self.tosca_schema = kb_tosca_model.schema_
        self.tosca_mapping = {}
        for (
            _,
            v,
        ) in kb_tosca_model.tosca_mapping.mapping_to_individual.model_dump().items():
            self.tosca_mapping = {**self.tosca_mapping, **v}

    @raise_exception(
        "Failed to update project ad model.",
        exception_logger=logger,
    )
    def update_project_ad_model(self):
        """Apply all card-node and data-flow-canvas updates to the project diagram."""
        if not self.project_ad_model.canvas:
            return

        user_story_cards = self.card_node_builder.user_story_cards
        card_nodes = self.card_node_builder.card_nodes

        # Update card_nodes
        self.project_ad_model.card_nodes = [
            CanvasCardNodeBaseModel(**_) for _ in card_nodes
        ]

        # Remove canvas_models without user story card associations
        self.remove_data_flow_canvas_without_card(cards=user_story_cards)

        # Remove nodes or edges from canvas if the user story card is removed
        self.remove_deleted_card_from_canvas()

        # Update canvas name and card ref of existing canvas_models
        self.update_existing_canvas(cards=user_story_cards)

        # Add new canvas_models with new user story card associations
        self.add_new_data_flow_canvas(cards=user_story_cards)

        # Add card ref to architecture canvas
        self.add_card_ref_to_architecture_canvas()

        # Update data_stored attribute of architecture node based on card ref
        self.update_data_stored()

        # Populate hidden data flow nodes onto the canvas
        self.populate_data_flow_node()

    @raise_exception(
        "Failed to add card ref to architecture canvas.",
        exception_logger=logger,
    )
    def add_card_ref_to_architecture_canvas(self):
        """Copy unique card references from data-flow canvases to the architecture canvas.

        Data-flow canvases each hold a ``card_ref`` for one user story card.
        The architecture canvas stores a consolidated ``card_ref`` so
        architecture nodes can refer to selectable card values across all data
        flows.
        """
        consolidated_card_ref = defaultdict(list)
        for canvas in self.project_ad_model.canvas:
            if canvas.canvas_type != CanvasType.data_flow.value:
                continue
            card_ref = canvas.ref.get("card_ref", {})

            for ref_key, ref_value in card_ref.items():
                if isinstance(ref_value, list):
                    consolidated_card_ref[ref_key].extend(ref_value)
                elif ref_value and isinstance(ref_value, dict):
                    consolidated_card_ref[ref_key].append(ref_value)

        _consolidated_card_ref = defaultdict(list)
        for ref_key, ref_value in consolidated_card_ref.items():
            seen_values = set()
            unique_card_ref = []
            for selectable_value in ref_value:
                val = selectable_value.get("value", "")
                if val not in seen_values:
                    seen_values.add(val)
                    unique_card_ref.append(selectable_value)
            _consolidated_card_ref[ref_key] = unique_card_ref

        for canvas in self.project_ad_model.canvas:
            if canvas.canvas_type != CanvasType.architecture.value:
                continue
            canvas.ref = {"card_ref": _consolidated_card_ref}

    @raise_exception(
        "Failed to update data stored of architecture nodes based on card ref.",
        exception_logger=logger,
    )
    def update_data_stored(self):
        """Remove stale ``data_stored`` values from architecture info nodes.

        Only data values still present in the consolidated architecture
        ``card_ref`` are kept. This prevents architecture nodes from retaining
        references to data entries that were removed from the questionnaire.
        """
        for canvas in self.project_ad_model.canvas:
            if canvas.canvas_type != CanvasType.architecture.value:
                continue

            card_data = canvas.ref.get("card_ref", {}).get(
                CardFieldId.card_data.name, []
            )
            data_value = [data.get("value", "") for data in card_data]

            for node in canvas.nodes:
                if node.type != CanvasNodeVariantType.infoNode.value:
                    continue

                data_stored = node.data.get("data_stored", [])
                updated_data_stored = [
                    item for item in data_stored if item in data_value
                ]

                if updated_data_stored != data_stored:
                    node.data["data_stored"] = updated_data_stored

    @raise_exception(
        "Failed to populate hidden data flow nodes onto canvas.",
        exception_logger=logger,
    )
    def populate_data_flow_node(self):
        """Populate hidden user, device, and interface nodes on data-flow canvases.

        Existing generated nodes are updated in place so their IDs, parent
        relationships, and canvas columns are preserved. Missing nodes are
        created from the canvas ``card_ref`` and hidden by default until the UI
        decides how to surface them.
        """
        for canvas in self.project_ad_model.canvas or []:
            if canvas.canvas_type != CanvasType.data_flow.value:
                continue
            card_ref = canvas.ref.get("card_ref", {})
            card_id = card_ref["card_id"]

            node_models = canvas.nodes or []
            node_id_set = {node.id for node in node_models}

            # Add user node
            user_nodes = card_ref[CardFieldId.card_users.name]
            for user_node in user_nodes:
                user_node_id = user_node["node_id"]
                if user_node_id in node_id_set:
                    self.update_existing_info_node(
                        card_id=card_id,
                        card_ref_key=CardFieldId.card_users.name,
                        cardFieldOptionId=user_node["value"],
                        node_icon=DATA_FLOW_USER_NODE_ICON,
                        node_id=user_node_id,
                        node_label=user_node["label"],
                        node_models=node_models,
                        parent_node="",
                        tosca_type=DATA_FLOW_USER_NODE_TOSCA_TYPE,
                    )
                    continue
                node = self.get_new_info_node(
                    card_id=card_id,
                    card_ref_key=CardFieldId.card_users.name,
                    cardFieldOptionId=user_node["value"],
                    node_icon=DATA_FLOW_USER_NODE_ICON,
                    node_id=user_node_id,
                    node_label=user_node["label"],
                    parent_node="",
                    canvasColumn=Position.left.value,
                    tosca_type=DATA_FLOW_USER_NODE_TOSCA_TYPE,
                )
                node_models.append(CanvasNodeBaseModel(**node))

            # Add device node
            device_nodes = card_ref[CardFieldId.card_devices.name]
            interface_nodes = card_ref[CardFieldId.card_interface.name]
            for device_node in device_nodes:
                device_node_id = device_node["node_id"]

                if device_node_id in node_id_set:
                    self.update_existing_cluster_node(
                        card_id=card_id,
                        cardFieldOptionId=device_node["value"],
                        node_icon=DATA_FLOW_DEVICE_NODE_ICON,
                        node_id=device_node_id,
                        node_label=device_node["label"],
                        node_models=node_models,
                    )

                if device_node_id not in node_id_set:
                    node = self.generate_cluster_node(
                        card_id=card_id,
                        cardFieldOptionId=device_node["value"],
                        node_icon=DATA_FLOW_DEVICE_NODE_ICON,
                        node_id=device_node_id,
                        node_label=device_node["label"],
                        canvasColumn=Position.left.value,
                    )
                    node_models.append(CanvasNodeBaseModel(**node))

                # Add interface node
                for interface_node in interface_nodes:
                    interface_node_id = f"{device_node_id}__{interface_node['value']}"
                    if interface_node_id in node_id_set:
                        self.update_existing_info_node(
                            card_id=card_id,
                            card_ref_key=CardFieldId.card_interface.name,
                            cardFieldOptionId=interface_node["value"],
                            cardFieldOptionIdAssoc=device_node["value"],
                            node_icon=DATA_FLOW_INTERFACE_NODE_ICON,
                            node_id=interface_node_id,
                            node_label=interface_node["label"],
                            node_models=node_models,
                            parent_node=device_node_id,
                            tosca_type=DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE,
                        )
                        continue

                    # node_label: str = interface_node["label"]
                    # label = node_label.title().replace(" ", "")
                    # camel_case_label = label[0].lower() + label[1:]
                    # tosca_type = self.tosca_mapping.get(camel_case_label, "")

                    node = self.get_new_info_node(
                        card_id=card_id,
                        card_ref_key=CardFieldId.card_interface.name,
                        cardFieldOptionId=interface_node["value"],
                        cardFieldOptionIdAssoc=device_node["value"],
                        node_icon=DATA_FLOW_INTERFACE_NODE_ICON,
                        node_id=interface_node_id,
                        node_label=interface_node["label"],
                        parent_node=device_node_id,
                        canvasColumn=Position.left.value,
                        tosca_type=DATA_FLOW_INTERFACE_NODE_TOSCA_TYPE,
                    )
                    node_models.append(CanvasNodeBaseModel(**node))
            canvas.nodes = node_models

    @raise_exception(
        "Failed to update existing info node.",
        exception_logger=logger,
    )
    def update_existing_info_node(
        self,
        node_id: str,
        node_models: list["CanvasNodeBaseModel"],
        **kwargs,
    ):
        """Refresh metadata for an existing data-flow info node.

        Args:
            node_id: Existing canvas node ID to update.
            node_models: Nodes currently present on the canvas.
            **kwargs: Values forwarded to :meth:`get_new_info_node` to rebuild
                the node data payload.

        Raises:
            InternalServerError: If ``node_id`` is not present in
                ``node_models``.
        """
        node_model = next(
            (_ for _ in node_models if node_id == _.id),
            None,
        )
        if not node_model:
            raise InternalServerError("Existing info node not found.")
        _node = self.get_new_info_node(
            node_id=node_id,
            canvasColumn=node_model.data.get("canvasColumn", Position.left.value),
            **kwargs,
        )
        node_model.data.update(_node["data"])

    @raise_exception(
        "Failed to update existing cluster node.",
        exception_logger=logger,
    )
    def update_existing_cluster_node(
        self,
        node_id: str,
        node_models: list["CanvasNodeBaseModel"],
        **kwargs,
    ):
        """Refresh metadata for an existing data-flow device cluster node.

        Args:
            node_id: Existing canvas node ID to update.
            node_models: Nodes currently present on the canvas.
            **kwargs: Values forwarded to :meth:`generate_cluster_node` to
                rebuild the cluster node data payload.

        Raises:
            InternalServerError: If ``node_id`` is not present in
                ``node_models``.
        """
        node_model = next(
            (_ for _ in node_models if node_id == _.id),
            None,
        )
        if not node_model:
            raise InternalServerError("Existing cluster node not found.")
        _node = self.generate_cluster_node(
            node_id=node_id,
            canvasColumn=node_model.data.get("canvasColumn", Position.left.value),
            **kwargs,
        )
        node_model.data.update(_node["data"])

    @raise_exception(
        "Failed to generate a info node.",
        exception_logger=logger,
    )
    def get_new_info_node(
        self,
        card_id: str,
        card_ref_key: str,
        cardFieldOptionId: str,
        node_icon: str,
        node_id: str,
        node_label: str,
        parent_node: str,
        tosca_type: str,
        canvasColumn: str,
        cardFieldOptionIdAssoc: str = "",
    ):
        """Build a hidden data-flow info node dictionary.

        Info nodes represent users and interfaces derived from questionnaire
        card references. Interface nodes may be attached to a parent device
        cluster through ``parent_node`` and can store an associated device
        option ID in ``cardFieldOptionIdAssoc``.

        Args:
            card_id: User story card ID that owns the generated node.
            card_ref_key: Card reference field that produced the node.
            cardFieldOptionId: Selected option ID represented by the node.
            node_icon: UI icon identifier.
            node_id: Stable canvas node ID.
            node_label: Display label for the node.
            parent_node: Parent cluster node ID, or an empty string.
            tosca_type: TOSCA type assigned to the generated node.
            canvasColumn: Initial data-flow column placement.
            cardFieldOptionIdAssoc: Optional associated option ID, used by
                interface nodes to record their device association.

        Returns:
            dict: Canvas node payload suitable for ``CanvasNodeBaseModel``.
        """
        info_node = copy.deepcopy(DEFAULT_NODE)
        info_node.update(
            {
                "data": {
                    "cardRefKey": card_ref_key,
                    "cardFieldOptionId": cardFieldOptionId,
                    "cardFieldOptionIdAssoc": cardFieldOptionIdAssoc,
                    "card_id": card_id,
                    "canvasColumn": canvasColumn,
                    "class": "",
                    "icon": node_icon,
                    "label": node_label,
                    "tosca_type": tosca_type,
                    "tosca_schema": self.tosca_schema,
                    "type": CanvasType.data_flow.value,
                },
                "hidden": True,
                "id": node_id,
                "parentId": parent_node,
                "style": {
                    "height": DEFAULT_ICON_NODE_HEIGHT,
                    "width": DEFAULT_ICON_NODE_WIDTH,
                },
                "type": CanvasNodeVariantType.infoNode.value,
            }
        )
        return info_node

    @raise_exception(
        "Failed to generate a cluster node.",
        exception_logger=logger,
    )
    def generate_cluster_node(
        self,
        card_id: str,
        cardFieldOptionId: str,
        node_icon: str,
        node_id: str,
        node_label: str,
        canvasColumn: str,
        cardFieldOptionIdAssoc: str = "",
    ):
        """Build a hidden device cluster node dictionary for a data-flow canvas.

        Args:
            card_id: User story card ID that owns the generated node.
            cardFieldOptionId: Selected device option ID represented by the node.
            node_icon: UI icon identifier.
            node_id: Stable canvas node ID.
            node_label: Display label for the cluster.
            canvasColumn: Initial data-flow column placement.
            cardFieldOptionIdAssoc: Optional associated option ID.

        Returns:
            dict: Canvas node payload suitable for ``CanvasNodeBaseModel``.
        """
        cluster_node = copy.deepcopy(DEFAULT_NODE)
        cluster_node.update(
            {
                "data": {
                    "cardRefKey": CardFieldId.card_devices.name,
                    "cardFieldOptionId": cardFieldOptionId,
                    "cardFieldOptionIdAssoc": cardFieldOptionIdAssoc,
                    "card_id": card_id,
                    "canvasColumn": canvasColumn,
                    "class": "",
                    "physicalLocation": "internet",
                    "icon": node_icon,
                    "icon_position": "top-left",
                    "label": node_label,
                    "tosca_type": DATA_FLOW_DEVICE_NODE_TOSCA_TYPE,
                    "tosca_schema": self.tosca_schema,
                    "type": CanvasType.data_flow.value,
                },
                "dragHandle": ".ClusterNode_DragHandle",
                "hidden": True,
                "id": node_id,
                "style": {
                    "backgroundColor": "unset",
                    "borderStyle": "solid",
                    "borderWidth": "2px",
                    "height": DEFAULT_CLUSTER_NODE_HEIGHT,
                    "keepAspectRatio": True,
                    "maxHeight": MAX_HEIGHT_CLUSTER_NODE,
                    "maxWidth": MAX_WIDTH_CLUSTER_NODE,
                    "minHeight": MIN_HEIGHT_CLUSTER_NODE,
                    "minWidth": MIN_WIDTH_CLUSTER_NODE,
                    "width": DEFAULT_CLUSTER_NODE_WIDTH,
                },
                "type": f"{CanvasNodeVariantType.clusterNode.value}",
            }
        )
        return cluster_node

    @raise_exception(
        "Failed to remove node/edge of deleted user story card node from canvas.",
        exception_logger=logger,
    )
    def remove_deleted_card_from_canvas(
        self,
    ) -> None:
        """Remove data-flow nodes and edges that no longer map to card nodes.

        The architecture canvas nodes are always retained. For data-flow
        canvases, generated card nodes are kept only when their card ID still
        appears in the card-node affiliation list. Edges are then filtered so
        both endpoints still exist.
        """
        card_node_mapping = {}
        if self.project_ad_model.card_nodes:
            for card_node in self.project_ad_model.card_nodes:
                if card_node.node_id:
                    card_node_mapping[card_node.node_id] = card_node.card_id_affliations
                else:
                    card_node_mapping[card_node.value] = card_node.card_id_affliations

        canvas_list = []
        architecture_node_id_list = []
        for canvas in self.project_ad_model.canvas or []:
            if canvas.canvas_type != CanvasType.data_flow.value:
                architecture_node_id_list = [node.id for node in (canvas.nodes or [])]
                canvas_list.append(canvas)
                continue

            # Filter user story card node based on conditions:
            # Remove when the node or parent node is not in card node
            # Remove when the node/parent node's card id is not in card id affiliations
            filtered_node_list = []
            filtered_node_id_list = []
            for node in canvas.nodes or []:
                card_ref_key = node.data.get("cardRefKey")
                if not card_ref_key:
                    continue
                node_id = node.id
                card_id = node.data["card_id"]
                parentId = node.parentId
                if card_ref_key == CardFieldId.card_interface.name:
                    if (
                        node_id.split("__")[1] not in card_node_mapping
                        or card_id not in card_node_mapping.get(node_id.split("__")[1])
                        or not card_node_mapping.get(parentId)
                        or card_id not in card_node_mapping.get(parentId)
                    ):
                        continue
                else:
                    if (
                        node_id not in card_node_mapping
                        or card_id not in card_node_mapping.get(node_id)
                    ):
                        continue
                filtered_node_list.append(node)
                filtered_node_id_list.append(node_id)
            filtered_node_id_list.extend(architecture_node_id_list)

            # Filter edge based on condition:
            # Keep the edge if its target and source exist
            edge_list = []
            if canvas.edges:
                edge_list = [
                    edge
                    for edge in canvas.edges
                    if edge.source in filtered_node_id_list
                    and edge.target in filtered_node_id_list
                ]
            canvas.nodes = filtered_node_list
            canvas.edges = edge_list
            canvas_list.append(canvas)
        self.project_ad_model.canvas = canvas_list

    @raise_exception(
        "Failed to remove data flow canvas without card assoc.",
        exception_logger=logger,
    )
    def remove_data_flow_canvas_without_card(
        self,
        cards: list[dict],
    ):
        """Remove data-flow canvases whose owning user story card no longer exists.

        Args:
            cards: Current submitted user story cards.
        """
        card_id_list = [_.get("card_id") for _ in cards]
        self.project_ad_model.canvas = [
            _
            for _ in (self.project_ad_model.canvas or [])
            if _.canvas_type != CanvasType.data_flow.value
            or (
                _.canvas_type == CanvasType.data_flow.value
                and _.ref.get("card_ref", {}).get("card_id") in card_id_list
            )
        ]

    @raise_exception(
        "Failed to retrieve canvas model card.",
        exception_logger=logger,
    )
    def get_canvas_model_card(
        self,
        canvas_model: CanvasBaseModel,
        cards: list[dict],
    ):
        """Return the user story card associated with a data-flow canvas.

        Args:
            canvas_model: Canvas whose ``ref.card_ref.card_id`` identifies the
                owning card.
            cards: Current submitted user story cards.

        Raises:
            InternalServerError: If the canvas card reference has no card ID.
            InternalServerError: If no submitted card matches the card ID.

        Returns:
            dict: The matching user story card.
        """
        card_id = canvas_model.ref.get("card_ref", {}).get("card_id")
        if not card_id:
            raise InternalServerError(f"card_id not found in card_ref. {card_id}")

        card = next(
            (_ for _ in cards if _.get("card_id") == card_id),
            None,
        )
        if not card:
            raise InternalServerError(
                f"Card with id {card_id} not found in questionnaire cards."
            )
        return card

    @raise_exception(
        "Failed to update existing canvas.",
        exception_logger=logger,
    )
    def update_existing_canvas(
        self,
        cards: list[dict],
    ):
        """Refresh card references and names for existing data-flow canvases.

        Args:
            cards: Current submitted user story cards.
        """
        for canvas_model in self.project_ad_model.canvas or []:
            if canvas_model.canvas_type != CanvasType.data_flow.value:
                continue

            card = self.get_canvas_model_card(
                canvas_model=canvas_model,
                cards=cards,
            )
            card_ref = CardNodeBuilder.get_card_ref_dict(card)

            card_nodes = [
                card_node.model_dump()
                for card_node in (self.project_ad_model.card_nodes or [])
            ]

            # Update card ref
            diagram_canvas_factory = DiagramCanvasFactory()
            diagram_canvas_factory.update_card_ref(card_ref, card_nodes)
            canvas_model.ref = {"card_ref": card_ref}

            # Update canvas name
            canvas_model.canvas_name = card_ref.get(CardFieldId.card_title.name, "")

    @raise_exception(
        "Failed to retrieve new cards.",
        exception_logger=logger,
    )
    def get_new_cards(
        self,
        cards: list[dict],
    ):
        """Return submitted user story cards without an existing data-flow canvas.

        Args:
            cards: Current submitted user story cards.

        Returns:
            list[dict]: Cards that need new data-flow canvases.
        """
        existing_model_card_id_list = [
            canvas_model.ref.get("card_ref", {}).get("card_id")
            for canvas_model in (self.project_ad_model.canvas or [])
            if canvas_model.canvas_type == CanvasType.data_flow.value
        ]
        return [
            card for card in cards if card["card_id"] not in existing_model_card_id_list
        ]

    @raise_exception(
        "Failed to add new data flow canvas.",
        exception_logger=logger,
    )
    def add_new_data_flow_canvas(
        self,
        cards: list[dict],
    ):
        """Create data-flow canvases for newly added user story cards.

        Args:
            cards: Current submitted user story cards.
        """
        new_cards = self.get_new_cards(
            cards=cards,
        )
        if not new_cards:
            return
        if self.project_ad_model.canvas is None:
            self.project_ad_model.canvas = []
        for new_card in new_cards:
            card_nodes = [
                card_node.model_dump()
                for card_node in (self.project_ad_model.card_nodes or [])
            ]

            diagram_canvas_factory = DiagramCanvasFactory()
            new_canvas = diagram_canvas_factory.create_new_data_flow_canvas(
                new_card,
                card_nodes,
            )
            self.project_ad_model.canvas.append(CanvasBaseModel(**new_canvas))
