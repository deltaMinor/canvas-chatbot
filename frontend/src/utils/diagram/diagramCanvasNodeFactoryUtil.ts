import React from "react";

import { XYPosition } from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import {
    ALLOWED_CHILD_NODES,
    ALLOWED_PARENT_NODES,
    CLUSTER_NODE_BACKGROUNDCOLOR,
    CLUSTER_NODE_BORDER_COLOR,
    CLUSTER_NODE_BORDER_STYLE,
    CLUSTER_NODE_BORDER_WIDTH,
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    DEFAULT_ZINDEX_CLUSTER_NODE,
    DEFAULT_ZINDEX_NODE,
    MAX_HEIGHT_CLUSTERNODE,
    MAX_WIDTH_CLUSTERNODE,
    MIN_HEIGHT_CLUSTERNODE,
    MIN_WIDTH_CLUSTERNODE,
} from "#root/constants/diagram";
import {
    CanvasNodeVariantType,
    CanvasType,
    DiagramCanvas,
    DiagramNode,
    NodeAttributes,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { NodeIconKey } from "#root/interfaces/svg";
import { getKbToscaFromStore } from "#root/stores/backendStore";
import { getInitializedDiagramNode } from "#root/utils/diagram/diagramNodeUtil";
import { getTerraformType } from "#root/utils/diagram/diagramTerraform";
import { updateNodeToscaType } from "#root/utils/diagram/diagramToscaUtil";
import { generateUUID } from "#root/utils/identifierUtil";
import { getMergedToscaMapping, getToscaSchema } from "#root/utils/toscaMapping";

const getNewInfoNode = ({
    node_attributes,
    position,
    node_count,
}: {
    node_attributes: NodeAttributes;
    position: XYPosition;
    node_count: number;
}) => {
    const kbTosca = getKbToscaFromStore();
    const toscaMapping = getMergedToscaMapping(kbTosca);
    const toscaSchema = getToscaSchema(kbTosca);
    const { node_type: attrNodeType, node_label, node_icon, node_data_type } = node_attributes;

    if (attrNodeType !== CanvasNodeVariantType.infoNode.toString()) {
        throw new Error("Invalid node type. Must be infoNode.");
    }

    const node: DiagramNode = {
        id: generateUUID(UuidIdentifierKey.diagramNode),
        position: node_count ? position : { x: 0, y: 0 },
        origin: [0, 0],
        type: attrNodeType,
        zIndex: DEFAULT_ZINDEX_NODE,
        height: DEFAULT_ICON_NODE_HEIGHT,
        width: DEFAULT_ICON_NODE_WIDTH,
        data: {
            class: getTerraformType(node_icon),
            data_stored: [],
            icon: `${node_icon}`,
            label: `${node_label}`,
            tosca_schema: toscaSchema,
            tosca_type: "",
            type: node_data_type,
            runs_vendor_software: false,
            network_functions_5g: [],
            ip_address: "",
        },
        style: {
            height: DEFAULT_ICON_NODE_HEIGHT,
            width: DEFAULT_ICON_NODE_WIDTH,
        },
    };

    updateNodeToscaType({ node, toscaMapping });
    return getInitializedDiagramNode(node);
};

const getNewClusterNode = ({
    node_attributes,
    position,
    node_count,
}: {
    node_attributes: NodeAttributes;
    position: XYPosition;
    node_count: number;
}) => {
    const kbTosca = getKbToscaFromStore();
    const toscaMapping = getMergedToscaMapping(kbTosca);
    const toscaSchema = getToscaSchema(kbTosca);
    const { node_type: attrNodeType, node_label, node_icon, node_data_type } = node_attributes;

    if (attrNodeType !== CanvasNodeVariantType.clusterNode.toString()) {
        throw new Error("Invalid node type. Must be clusterNode.");
    }

    const node: DiagramNode = {
        id: generateUUID(UuidIdentifierKey.diagramNode),
        dragHandle: ".ClusterNode_DragHandle",
        position: node_count ? position : { x: 0, y: 0 },
        origin: [0, 0],
        type: attrNodeType,
        zIndex: DEFAULT_ZINDEX_CLUSTER_NODE,
        height: DEFAULT_CLUSTER_NODE_HEIGHT,
        width: DEFAULT_CLUSTER_NODE_WIDTH,
        data: {
            class: `${getTerraformType(node_icon)}`,
            data_stored: [],
            publiclyAccessible: false,
            icon_position: "top-left",
            icon: `${node_icon}`,
            label: node_label,
            tosca_schema: toscaSchema,
            tosca_type: "",
            type: node_data_type,
            allowed_child_nodes:
                ALLOWED_CHILD_NODES[node_icon as keyof typeof ALLOWED_CHILD_NODES] ?? [],
            allowed_parent_nodes:
                ALLOWED_PARENT_NODES[node_icon as keyof typeof ALLOWED_PARENT_NODES] ?? [],
        },
        style: {
            backgroundColor:
                CLUSTER_NODE_BACKGROUNDCOLOR[
                    node_icon as keyof typeof CLUSTER_NODE_BACKGROUNDCOLOR
                ] || "unset",
            borderColor:
                CLUSTER_NODE_BORDER_COLOR[node_icon as keyof typeof CLUSTER_NODE_BORDER_COLOR],
            borderStyle:
                CLUSTER_NODE_BORDER_STYLE[node_icon as keyof typeof CLUSTER_NODE_BORDER_STYLE] ||
                "solid",
            borderWidth:
                CLUSTER_NODE_BORDER_WIDTH[node_icon as keyof typeof CLUSTER_NODE_BORDER_WIDTH] ||
                "2px",
            height: DEFAULT_CLUSTER_NODE_HEIGHT,
            width: DEFAULT_CLUSTER_NODE_WIDTH,
            maxHeight: MAX_HEIGHT_CLUSTERNODE,
            maxWidth: MAX_WIDTH_CLUSTERNODE,
            minHeight: MIN_HEIGHT_CLUSTERNODE,
            minWidth: MIN_WIDTH_CLUSTERNODE,
        },
    };

    updateNodeToscaType({ node, toscaMapping });
    if (node_icon === NodeIconKey.awsCloud) {
        node.data.hostedInGCC = false;
    }
    return getInitializedDiagramNode(node);
};

export const getSpecificNewNodeOnDrop = (props: {
    node_attributes: NodeAttributes;
    position: XYPosition;
    node_count: number;
}) => {
    const nodeType = props.node_attributes.node_type;
    if (nodeType === CanvasNodeVariantType.infoNode.toString()) {
        return getNewInfoNode(props);
    }
    if (nodeType === CanvasNodeVariantType.clusterNode.toString()) {
        return getNewClusterNode(props);
    }
    return undefined;
};

export const getNodeAttributesFromEventData = (event: React.DragEvent<Element>) =>
    ({
        node_icon: event.dataTransfer.getData("application/node_icon") || "",
        node_label: event.dataTransfer.getData("application/node_label") || "",
        node_type: event.dataTransfer.getData("application/node_type") || "",
        node_data_type: event.dataTransfer.getData("application/node_data_type") || "",
        node_card_field_id_assoc:
            event.dataTransfer.getData("application/node_card_field_id_assoc") || "",
        node_card_field_id: event.dataTransfer.getData("application/node_card_field_id") || "",
        node_card_id: event.dataTransfer.getData("application/node_card_id") || "",
        node_card_ref_key: event.dataTransfer.getData("application/node_card_ref_key") || "",
    }) as NodeAttributes;

export const checkInitialNodeDropConditions = ({
    node_attributes,
    selectedCanvasType,
}: {
    node_attributes: NodeAttributes;
    selectedCanvasType?: DiagramCanvas["canvas_type"] | undefined;
}) => {
    if (!selectedCanvasType) {
        enqueueSnackbar("Canvas view type is undefined.", { variant: "error" });
        return false;
    }

    const requiredNodeAttributes = [
        "node_label",
        "node_type",
        "node_icon",
        "node_id",
        "node_data_type",
    ];
    if (
        Object.entries(node_attributes).some(
            ([keyAttr, valueAttr]) => requiredNodeAttributes.includes(keyAttr) && !valueAttr
        )
    ) {
        enqueueSnackbar("One or more mandatory node properties are undefined.", {
            variant: "error",
        });
        return false;
    }

    if (
        [CanvasType.architecture, CanvasType.data_flow].includes(selectedCanvasType) &&
        node_attributes.node_data_type !== selectedCanvasType
    ) {
        enqueueSnackbar(
            `Cannot create node of type ${node_attributes.node_data_type} in canvas of type ${selectedCanvasType}.`,
            { variant: "error" }
        );
        return false;
    }

    return true;
};
