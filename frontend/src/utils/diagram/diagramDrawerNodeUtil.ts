import * as lodash from "lodash";

import { default_node } from "#root/constants/diagram";
import { dialogConfirmStateKeys, dialogFieldStateKeys } from "#root/constants/diagramDrawerNode";
import { CanvasNodeType, DiagramNode } from "#root/interfaces/diagram";
import {
    CustomFieldGroup,
    DiagramElementAttrBaseFieldKey,
    DiagramElementAttributes,
    DiagramElementType,
    HandleAddAttribute,
    HandleRemoveLocal,
    HandleRenewAttribute,
} from "#root/interfaces/diagramAttributes";
import { NodeAttributeFactory } from "#root/lib/NodeAttributeFactory";
import { selectBackendProjectDiagram } from "#root/selectors/backendSelectors";
import { getKbToscaFromStore } from "#root/stores/backendStore";
import { handleOpenDialog } from "#root/stores/dialogStore";
import {
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import { getDiagramDraftNodeFromStore } from "#root/stores/projectDiagram/drawer";
import {
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";
import { updateAllCanvasesWithSameNodes } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getRootStateFromStore } from "#root/stores/root";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";
import { getAllNodes } from "#root/utils/diagram/backendDiagramUtil";
import {
    generateDiagramElementDetails,
    generateDiagramMainElementDetails,
} from "#root/utils/diagram/diagramAttributeUtil";
import { getToscaType } from "#root/utils/diagram/diagramToscaUtil";
import { getFilteredNode } from "#root/utils/diagramAttributeDrawerUtil";
import { getMergedToscaMapping, getToscaSchema } from "#root/utils/toscaMapping";

export const processSaveNode = async ({
    instanceId,
    handleSetProcessedNodes,
    draftNodeOverride,
}: {
    instanceId: string;
    handleSetProcessedNodes: (props: {
        canvasNodes: DiagramNode[];
        architectureNodes?: DiagramNode[];
        filterAuthorizedNodes?: boolean;
        filterSelectedViewNodes?: boolean;
        funcRef?: string;
        skipRefreshNodeHandleEdgeMappingList?: boolean;
    }) => DiagramNode[];
    draftNodeOverride?: DiagramNode;
}) => {
    const context__nodes = getDiagramDraftCanvasNodesFromStore(instanceId);
    const draftNode = draftNodeOverride ?? getDiagramDraftNodeFromStore(instanceId);
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    if (!draftNode) return;

    if (!draftNode.data.label) {
        handleOpenDialog(dialogConfirmStateKeys.requestToFillRequiredFields);
        return;
    }

    // Update local states
    const filteredCanvasNodes = getFilteredCanvasNodesOrEdges<DiagramNode>(
        context__nodes,
        selectedCanvasType
    );

    // Ensure height/width stay consistent with style values without mutating the draft object.
    const normalizedDraftNode: DiagramNode = {
        ...draftNode,
        height: Number(draftNode?.style?.height),
        width: Number(draftNode?.style?.width),
    };

    const canvasNodes = filteredCanvasNodes.map((n) => {
        if (n.id !== normalizedDraftNode.id) {
            return n;
        }
        return {
            ...n, //
            ...normalizedDraftNode,
        };
    });

    // Update database
    handleSetProcessedNodes({
        canvasNodes: canvasNodes, //
        funcRef: "handleSaveNode",
    });
    await updateAllCanvasesWithSameNodes({
        instanceId,
        node: normalizedDraftNode,
    });
};

export const getNodeAttributes = ({
    draftNode,
    isNodeEditable,
}: {
    draftNode: DiagramNode | null;
    isNodeEditable: boolean;
}) => {
    const state = getRootStateFromStore();
    const projectDiagram = selectBackendProjectDiagram(state);
    const allNodes = getAllNodes(projectDiagram);

    if (!projectDiagram || !draftNode) {
        return {
            nodeAttributes: {
                main: [],
                main_advanced: [],
                data: [],
                data_advanced: [],
                style_advanced: [],
                cacti: [],
                style: [],
            },
        };
    }

    const nodeAttributeFactory = new NodeAttributeFactory({
        draftNode,
        projectDiagram,
        allNodes,
    });

    return {
        nodeAttributes: {
            main: generateDiagramMainElementDetails<DiagramNode>(
                draftNode,
                nodeAttributeFactory.main,
                isNodeEditable,
                allNodes
            ),
            main_advanced: generateDiagramMainElementDetails<DiagramNode>(
                draftNode,
                nodeAttributeFactory.main_advanced,
                isNodeEditable,
                allNodes
            ),
            data: generateDiagramElementDetails(
                { ...draftNode?.data },
                nodeAttributeFactory.data,
                isNodeEditable
                // true
            ),
            data_advanced: generateDiagramElementDetails(
                { ...draftNode?.data },
                nodeAttributeFactory.data_advanced,
                isNodeEditable
                // true
            ),
            style: generateDiagramElementDetails(
                { ...draftNode?.style },
                nodeAttributeFactory.style,
                isNodeEditable
            ),
            style_advanced: generateDiagramElementDetails(
                { ...draftNode?.style },
                nodeAttributeFactory.style_advanced,
                isNodeEditable
            ),
            cacti: generateDiagramElementDetails(
                { ...draftNode?.data },
                nodeAttributeFactory.cacti,
                isNodeEditable
            ),
        },
    };
};

export const processVerifyCloseNodeDrawer = async ({
    instanceId,
    handleCloseNodeInfoDrawer,
}: {
    instanceId?: string;
    handleCloseNodeInfoDrawer?: () => Promise<void>;
}) => {
    if (!instanceId || !handleCloseNodeInfoDrawer) {
        throw new Error("One or more required fields are undefined.");
    }
    const draftNode = getDiagramDraftNodeFromStore(instanceId);
    if (!draftNode) return;
    const node_keys_to_check = Object.keys({
        ...default_node,
        ...draftNode,
    });
    const ref_node = getDiagramDraftCanvasNodesFromStore(instanceId).find(
        (n) => n.id === draftNode.id
    );
    if (!ref_node) return;

    const filtered_ref_node = getFilteredNode(
        ref_node, //
        node_keys_to_check
    );
    if (!filtered_ref_node) return;

    const filtered_localNode = getFilteredNode(draftNode, node_keys_to_check);
    if (!filtered_localNode) return;

    const isEqual = lodash.isEqual(filtered_localNode, filtered_ref_node);
    if (!!isEqual) {
        setDiagramSelectedNodeIdList([], instanceId);
        setDiagramSelectedEdgeIdList([], instanceId);
        handleCloseNodeInfoDrawer();
        return;
    }

    if (!draftNode?.data?.label) {
        handleOpenDialog(dialogConfirmStateKeys.requestToFillRequiredFields);
        return;
    }

    // Prompt the user if it is fine to close the sidebar
    handleOpenDialog(dialogConfirmStateKeys.closeDrawerNode);
};

export const processAddDrawerNodeAttribute = async ({
    instanceId,
    baseAttrKey,
    data,
    reloadNodeAttributes,
    setDraftNode,
}: {
    instanceId: string;
    baseAttrKey: string;
    data: { [key: string]: unknown };
    reloadNodeAttributes: (_draftNode?: DiagramNode) => Promise<void>;
    setDraftNode: React.SetStateAction<DiagramNode | null> extends infer _
        ? (value: React.SetStateAction<DiagramNode | null>) => void
        : never;
}) => {
    if (!baseAttrKey || !data) {
        return;
    }

    const draftNode = getDiagramDraftNodeFromStore(instanceId);
    if (!draftNode) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        return;
    }

    const localNode__baseAttrVal = draftNode?.[baseAttrKey as keyof typeof draftNode] || {};
    if (typeof localNode__baseAttrVal !== "object") {
        throw new Error("Mistyped property.");
    }
    const __localNode = {
        ...draftNode,
        [baseAttrKey]: {
            ...localNode__baseAttrVal,
            ...data,
        },
    };
    setDraftNode(__localNode);
    await reloadNodeAttributes(__localNode);
};

export const processUpdateAttrDrawerNode = async ({
    instanceId,
    baseAttrKey,
    data,
    reloadNodeAttributes,
    setDraftNode,
}: {
    instanceId: string;
    baseAttrKey: string;
    data: { [key: string]: unknown };
    reloadNodeAttributes: (_draftNode?: DiagramNode) => Promise<void>;
    setDraftNode: (value: React.SetStateAction<DiagramNode | null>) => void;
}) => {
    if (!data || !baseAttrKey) return;

    const draftNode = getDiagramDraftNodeFromStore(instanceId);
    if (!draftNode) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        const nextDraftNode = { ...draftNode, ...data };
        setDraftNode(nextDraftNode);
        await reloadNodeAttributes(nextDraftNode);
        return;
    }

    const localNode__baseAttrVal = draftNode?.[baseAttrKey as keyof typeof draftNode] || {};
    if (typeof localNode__baseAttrVal !== "object") {
        throw new Error("Mistyped property.");
    }
    const nextDraftNode = {
        ...draftNode,
        [baseAttrKey]: {
            ...localNode__baseAttrVal,
            ...data,
        },
    };
    setDraftNode(nextDraftNode);
    await reloadNodeAttributes(nextDraftNode);
};

export const processRemoveAttrDrawerNode = async ({
    instanceId,
    baseAttrKey,
    attrKey,
    reloadNodeAttributes,
    setDraftNode,
}: {
    instanceId: string;
    baseAttrKey: string;
    attrKey: string;
    reloadNodeAttributes: (_draftNode?: DiagramNode) => Promise<void>;
    setDraftNode: (value: React.SetStateAction<DiagramNode | null>) => void;
}) => {
    if (!baseAttrKey || !attrKey) return;

    const draftNode = getDiagramDraftNodeFromStore(instanceId);
    if (!draftNode) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        const { [baseAttrKey as keyof DiagramNode]: attrVal, ...rest } = draftNode;
        void attrVal;
        const nextDraftNode = rest as DiagramNode;
        setDraftNode(nextDraftNode);
        await reloadNodeAttributes(nextDraftNode);
        return;
    }

    const baseAttrVal = draftNode?.[baseAttrKey as keyof typeof draftNode] || {};
    if (typeof baseAttrVal !== "object") {
        throw new Error("Mistyped property.");
    }
    const { [attrKey as keyof typeof baseAttrVal]: attrVal, ...rest } = baseAttrVal;
    void attrVal;
    const nextDraftNode = {
        ...draftNode,
        [baseAttrKey]: rest,
    };
    setDraftNode(nextDraftNode);
    await reloadNodeAttributes(nextDraftNode);
};

export const processAddNodeAttribute = async ({
    attributeSetType,
}: {
    instanceId: string;
    attributeSetType: DiagramElementType;
}) => {
    switch (attributeSetType) {
        case "style":
            handleOpenDialog(dialogFieldStateKeys.addStyleAttribute);
            break;
        case "data":
            handleOpenDialog(dialogFieldStateKeys.addDataAttribute);
            break;
        case "cacti":
            handleOpenDialog(dialogFieldStateKeys.addDataCactiAttribute);
            break;
        default:
            throw new Error(`Attribute (${attributeSetType}) not supported`);
    }
};

export const processRenewNodeAttribute = async ({
    instanceId,
    property,
    attributeKey,
    reloadNodeAttributes,
    setDraftNode,
}: {
    instanceId: string;
    property: DiagramElementAttrBaseFieldKey;
    attributeKey: string;
    reloadNodeAttributes: (_draftNode?: DiagramNode) => Promise<void>;
    setDraftNode: (value: React.SetStateAction<DiagramNode | null>) => void;
}) => {
    if (attributeKey === "tosca_type") {
        const kbTosca = getKbToscaFromStore();
        const toscaMapping = getMergedToscaMapping(kbTosca);
        const toscaSchema = getToscaSchema(kbTosca);
        const draftNode = getDiagramDraftNodeFromStore(instanceId);
        if (!draftNode) return;

        await processAddDrawerNodeAttribute({
            instanceId,
            baseAttrKey: property.toString(),
            data: {
                [attributeKey]: getToscaType({
                    node: draftNode,
                    toscaMapping,
                }),
                tosca_schema: toscaSchema,
            },
            reloadNodeAttributes,
            setDraftNode,
        });
    }
};

export interface BuildDefaultNodeFieldGroupsProps {
    diagram_attributes: DiagramElementAttributes;
    diagram_data: DiagramNode;
    editable: boolean;
    draftNode: DiagramNode;
    handleAddAttribute: HandleAddAttribute;
    handleRemoveLocal: HandleRemoveLocal;
    handleRenewAttribute: HandleRenewAttribute;
}

export function buildDefaultNodeFieldGroups({
    diagram_attributes,
    diagram_data,
    editable,
    draftNode,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
}: BuildDefaultNodeFieldGroupsProps): CustomFieldGroup[] {
    const isArchitectureNode = draftNode?.data?.type === CanvasNodeType.architecture.toString();
    return [
        {
            title: "Data",
            tab_value: "data",
            default_expanded: true,
            fields: [
                {
                    attributes: diagram_attributes?.data || [],
                    attributeSetType: "data",
                    disable_add: false,
                    editable,
                    property: DiagramElementAttrBaseFieldKey.data,
                    refKey: "data",
                    refObject: { ...diagram_data?.data },
                    handleAddAttribute,
                    handleRemoveLocal,
                    handleRenewAttribute,
                },
            ],
        },
        {
            title: "Data (Advanced)",
            tab_value: "data",
            default_expanded: true,
            fields: [
                {
                    attributes: diagram_attributes?.data_advanced || [],
                    attributeSetType: "data",
                    disable_add: true,
                    editable,
                    property: DiagramElementAttrBaseFieldKey.data,
                    refKey: "data",
                    refObject: { ...diagram_data?.data },
                    handleAddAttribute,
                    handleRemoveLocal,
                    handleRenewAttribute,
                },
            ],
        },
        {
            title: "Properties",
            tab_value: "properties",
            default_expanded: true,
            fields: [
                {
                    attributes: diagram_attributes?.main || [],
                    attributeSetType: "main",
                    disable_add: true,
                    editable,
                    property: DiagramElementAttrBaseFieldKey.main,
                    refKey: "main",
                    refObject: { ...diagram_data },
                    handleAddAttribute,
                    handleRemoveLocal,
                    handleRenewAttribute,
                },
            ],
        },
        {
            title: "Style",
            tab_value: "style",
            default_expanded: true,
            fields: [
                {
                    attributes: diagram_attributes?.style || [],
                    attributeSetType: "style",
                    disable_add: !isArchitectureNode,
                    editable,
                    property: DiagramElementAttrBaseFieldKey.style,
                    refKey: "style",
                    refObject: { ...diagram_data?.style },
                    handleAddAttribute,
                    handleRemoveLocal,
                    handleRenewAttribute,
                },
            ],
        },
        // {
        //     title: "Cacti",
        //     tab_value: "data",
        //     fields: [
        //         {
        //             attributes: diagram_attributes?.cacti || [],
        //             attributeSetType: "cacti",
        //             disable_add: true,
        //             editable,
        //             property: DiagramElementAttrBaseFieldKey.data,
        //             refKey: "cacti",
        //             refObject: { ...diagram_data?.data },
        //             handleAddAttribute,
        //             handleSetLocal,
        //             handleRemoveLocal,
        //             handleRenewAttribute,
        //         },
        //     ],
        // },
    ];
}
