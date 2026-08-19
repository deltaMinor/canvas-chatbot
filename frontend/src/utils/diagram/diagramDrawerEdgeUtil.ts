import { Edge, EdgeMarker, MarkerType } from "@xyflow/react";
import * as lodash from "lodash";

import { default_edge } from "#root/constants/diagram";
import { dialogConfirmStateKeys, dialogFieldStateKeys } from "#root/constants/diagramDrawerEdge";
import { CanvasNodeType, CanvasType, DiagramCanvas, DiagramEdge } from "#root/interfaces/diagram";
import {
    CustomFieldGroup,
    DiagramElementAttrBaseFieldKey,
    DiagramElementAttributes,
    DiagramElementType,
    HandleAddAttribute,
    HandleRemoveLocal,
    HandleRenewAttribute,
} from "#root/interfaces/diagramAttributes";
import { EdgeAttributeFactory } from "#root/lib/EdgeAttributeFactory";
import { selectBackendProjectDiagram } from "#root/selectors/backendSelectors";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasTypeFromStore,
} from "#root/stores/projectDiagram/canvas";
import { getDiagramDraftEdgeFromStore } from "#root/stores/projectDiagram/drawer";
import {
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";
import { updateSingleEdge } from "#root/stores/projectDiagramFeaturePersistenceStore";
import { getRootStateFromStore } from "#root/stores/root";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";
import { getAllEdges, getAllNodes } from "#root/utils/diagram/backendDiagramUtil";
import {
    generateDiagramElementDetails,
    generateDiagramMainElementDetails,
} from "#root/utils/diagram/diagramAttributeUtil";
import { getFilteredEdge } from "#root/utils/diagramAttributeDrawerUtil";

export const processVerifyCloseEdgeDrawer = async ({
    instanceId,
    handleCloseEdgeInfoDrawer,
}: {
    instanceId: string;
    handleCloseEdgeInfoDrawer: () => Promise<void>;
}) => {
    const draftEdge = getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    const edge_keys_to_check = Object.keys({
        ...default_edge,
        ...draftEdge,
    });

    const ref_edge = getDiagramDraftCanvasEdgesFromStore(instanceId).find(
        (e) => e?.id === draftEdge?.id
    );
    if (!ref_edge) return;

    const filtered_ref_edge = getFilteredEdge(
        ref_edge, //
        edge_keys_to_check
    );
    if (!filtered_ref_edge) return;

    const filtered_localEdge = getFilteredEdge(draftEdge, edge_keys_to_check);
    if (!filtered_localEdge) return;

    const isEqual = lodash.isEqual(
        filtered_localEdge, //
        filtered_ref_edge
    );
    if (!!isEqual) {
        // Close the sidebar
        setDiagramSelectedNodeIdList([], instanceId);
        setDiagramSelectedEdgeIdList([], instanceId);
        handleCloseEdgeInfoDrawer();
        return;
    }

    // Prompt the user if it is fine to close the sidebar
    handleOpenDialog(dialogConfirmStateKeys.closeDrawerEdge);
};

export const getEdgeAttributes = ({
    draftEdge,
    isEdgeEditable,
}: {
    draftEdge: DiagramEdge | null;
    isEdgeEditable: boolean;
}) => {
    const state = getRootStateFromStore();
    const projectDiagram = selectBackendProjectDiagram(state);
    const allNodes = getAllNodes(projectDiagram);
    const allEdges = getAllEdges(projectDiagram);
    if (!projectDiagram || !draftEdge) {
        return {
            edgeAttributes: {
                main: [],
                main_advanced: [],
                data: [],
                data_advanced: [],
                style: [],
                style_advanced: [],
                marker: [],
                cacti: [],
            },
        };
    }

    const edgeAttributeFactory = new EdgeAttributeFactory({
        draftEdge,
        projectDiagram,
        allEdges,
    });

    const edgeAttributes = {
        main: generateDiagramMainElementDetails<Edge>(
            draftEdge,
            edgeAttributeFactory.main,
            isEdgeEditable,
            allNodes
        ),
        main_advanced: generateDiagramMainElementDetails<Edge>(
            draftEdge,
            edgeAttributeFactory.main_advanced,
            isEdgeEditable,
            allNodes
        ),
        data: generateDiagramElementDetails(
            { ...draftEdge?.data },
            edgeAttributeFactory.data,
            isEdgeEditable
        ),
        data_advanced: generateDiagramElementDetails(
            { ...draftEdge?.data },
            edgeAttributeFactory.data_advanced,
            isEdgeEditable
        ),
        style: generateDiagramElementDetails(
            { ...draftEdge?.style },
            edgeAttributeFactory.style,
            isEdgeEditable
        ),
        style_advanced: generateDiagramElementDetails(
            { ...draftEdge?.style },
            edgeAttributeFactory.style_advanced,
            isEdgeEditable
        ),
        cacti: generateDiagramElementDetails(
            { ...draftEdge?.data },
            edgeAttributeFactory.cacti,
            isEdgeEditable
        ),
        markerStart: generateDiagramElementDetails(
            { ...(draftEdge?.markerStart as EdgeMarker) },
            edgeAttributeFactory.marker,
            isEdgeEditable
        ),
        markerEnd: generateDiagramElementDetails(
            { ...(draftEdge?.markerEnd as EdgeMarker) },
            edgeAttributeFactory.marker,
            isEdgeEditable
        ),
    };

    return {
        edgeAttributes, //
    };
};

export const processSaveEdge = async ({
    instanceId,
    appendCanvasHistory,
    handleSetProcessedEdges,
    draftEdgeOverride,
}: {
    instanceId: string;
    appendCanvasHistory: (selectedCanvas: DiagramCanvas) => void;
    handleSetProcessedEdges: (p: {
        canvasEdges: DiagramEdge[];
        architectureEdges?: DiagramEdge[];
        filterAuthorizedEdges?: boolean;
        filterSelectedViewEdges?: boolean;
        funcRef?: string;
        skipRefreshNodeEdgeMappingList?: boolean;
    }) => DiagramEdge[];
    draftEdgeOverride?: DiagramEdge;
}) => {
    const context__edges = getDiagramDraftCanvasEdgesFromStore(instanceId);
    const selectedCanvasId = getDraftCanvasIdFromStore(instanceId) ?? "";
    const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
    const draftEdge = draftEdgeOverride ?? getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    // Filter edges
    const filteredEdges = getFilteredCanvasNodesOrEdges<Edge>(
        context__edges,
        selectedCanvasType ?? CanvasType.architecture
    );

    // Update local states
    const canvasEdges = filteredEdges?.map((edge) => {
        if (edge?.id === draftEdge?.id) {
            return draftEdge;
        }
        return edge;
    });

    // Update database
    handleSetProcessedEdges({
        canvasEdges: canvasEdges, //
        funcRef: "handleSaveEdge",
    });
    const updatedCanvas = await updateSingleEdge({
        edge: draftEdge,
        canvas_id: selectedCanvasId,
        instanceId,
        funcRef: "handleSaveEdge",
    });
    if (updatedCanvas) {
        appendCanvasHistory(updatedCanvas);
    }
};

export const processAddDrawerEdgeAttribute = async ({
    instanceId,
    baseAttrKey,
    data,
    reloadEdgeAttributes,
    setDraftEdge,
}: {
    instanceId: string;
    baseAttrKey: string;
    data: { [key: string]: unknown };
    reloadEdgeAttributes: (_draftEdge?: DiagramEdge) => Promise<void>;
    setDraftEdge: (value: React.SetStateAction<DiagramEdge | null>) => void;
}) => {
    if (!baseAttrKey || !data) {
        return;
    }

    const draftEdge = getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        return;
    }

    const localEdge__baseAttrVal = draftEdge?.[baseAttrKey as keyof typeof draftEdge] || {};
    if (typeof localEdge__baseAttrVal !== "object") {
        throw new Error("Mistyped property.");
    }
    const __localEdge = {
        ...draftEdge,
        [baseAttrKey]: {
            ...localEdge__baseAttrVal,
            ...data,
        },
    };
    setDraftEdge(__localEdge);
    await reloadEdgeAttributes(__localEdge);
};

export const processAddDrawerEdgeMarker = async ({
    instanceId,
    markerKey,
    data,
    reloadEdgeAttributes,
    setDraftEdge,
}: {
    instanceId: string;
    markerKey: string;
    data: { [key: string]: unknown };
    reloadEdgeAttributes: (_draftEdge?: DiagramEdge) => Promise<void>;
    setDraftEdge: (value: React.SetStateAction<DiagramEdge | null>) => void;
}) => {
    if (!markerKey || !data) return;

    const draftEdge = getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    const currentVal = draftEdge?.[markerKey as keyof typeof draftEdge];

    // If marker is already a string, preserve it
    if (typeof currentVal === "string") return;

    // If marker doesn't exist, create it
    if (!currentVal) {
        const _localEdge = { ...draftEdge, [markerKey]: { ...data } };
        setDraftEdge(_localEdge);
        await reloadEdgeAttributes(_localEdge);
        return;
    }

    // If marker exists as object, merge the data
    const localEdge__markerKey = draftEdge?.[markerKey as keyof typeof draftEdge] || {};
    if (typeof localEdge__markerKey !== "object") {
        throw new Error("Mistyped property.");
    }
    const _localEdge = {
        ...draftEdge,
        [markerKey]: {
            ...localEdge__markerKey,
            ...data,
        },
    };
    setDraftEdge(_localEdge);
    await reloadEdgeAttributes(_localEdge);
};

export const processUpdateDrawerEdge = async ({
    instanceId,
    baseAttrKey,
    data,
    reloadEdgeAttributes,
    setDraftEdge,
}: {
    instanceId: string;
    baseAttrKey: string;
    data: { [key: string]: unknown };
    reloadEdgeAttributes: (_draftEdge?: DiagramEdge) => Promise<void>;
    setDraftEdge: (value: React.SetStateAction<DiagramEdge | null>) => void;
}) => {
    if (!data || !baseAttrKey) return;

    const draftEdge = getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        const nextDraftEdge = { ...draftEdge, ...data };
        setDraftEdge(nextDraftEdge);
        await reloadEdgeAttributes(nextDraftEdge);
        return;
    }

    // Special handling for bidirectional edge changes
    if (
        baseAttrKey === DiagramElementAttrBaseFieldKey.data.toString() &&
        !!Object.keys(data)?.includes("bidirectional")
    ) {
        const bidirectional = !!data?.["bidirectional"];

        const localEdge__property = draftEdge?.[baseAttrKey as keyof typeof draftEdge] || {};
        if (typeof localEdge__property !== "object") {
            throw new Error("Mistyped property.");
        }
        const __localEdge = structuredClone({
            ...draftEdge,
            [baseAttrKey]: {
                ...localEdge__property,
                ...data,
            },
        });
        // Keep markerStart only for explicitly bidirectional edges.
        if (!bidirectional) {
            delete __localEdge["markerStart"];
        } else {
            __localEdge["markerStart"] = {
                type: MarkerType.ArrowClosed,
                color: "#000",
            };
        }
        setDraftEdge(__localEdge);
        await reloadEdgeAttributes(__localEdge);
        return;
    }

    // Standard update for other base attribute keys
    const localEdge__property = draftEdge?.[baseAttrKey as keyof typeof draftEdge] || {};
    if (typeof localEdge__property !== "object") {
        throw new Error("Mistyped property.");
    }
    const __localEdge = {
        ...draftEdge,
        [baseAttrKey]: {
            ...localEdge__property,
            ...data,
        },
    };
    setDraftEdge(__localEdge);
    await reloadEdgeAttributes(__localEdge);
};

export const processRemoveAttrDrawerEdge = async ({
    instanceId,
    baseAttrKey,
    attrKey,
    reloadEdgeAttributes,
    setDraftEdge,
}: {
    instanceId: string;
    baseAttrKey: string;
    attrKey: string;
    reloadEdgeAttributes: (_draftEdge?: DiagramEdge) => Promise<void>;
    setDraftEdge: (value: React.SetStateAction<DiagramEdge | null>) => void;
}) => {
    if (!baseAttrKey || !attrKey) return;

    const draftEdge = getDiagramDraftEdgeFromStore(instanceId);
    if (!draftEdge) return;

    if (baseAttrKey === DiagramElementAttrBaseFieldKey.main.toString()) {
        const { [attrKey as keyof DiagramEdge]: attrVal, ...rest } = draftEdge;
        void attrVal;
        const nextDraftEdge = rest as DiagramEdge;
        setDraftEdge(nextDraftEdge);
        await reloadEdgeAttributes(nextDraftEdge);
        return;
    }

    const baseAttrVal = draftEdge?.[baseAttrKey as keyof typeof draftEdge] || {};
    if (typeof baseAttrVal !== "object") {
        throw new Error("Mistyped property.");
    }
    const { [attrKey as keyof typeof baseAttrVal]: attrVal, ...rest } = baseAttrVal;
    void attrVal;
    const nextDraftEdge = {
        ...draftEdge,
        [baseAttrKey]: rest,
    };
    setDraftEdge(nextDraftEdge);
    await reloadEdgeAttributes(nextDraftEdge);
};

export const processAddEdgeAttribute = async ({
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
        case "markerStart":
            handleOpenDialog(dialogFieldStateKeys.addMarkerStartAttribute);
            break;
        case "markerEnd":
            handleOpenDialog(dialogFieldStateKeys.addMarkerEndAttribute);
            break;
        default:
            throw new Error(`Attribute (${attributeSetType}) not supported`);
    }
};

export interface BuildDefaultEdgeFieldGroupsProps {
    diagram_attributes: DiagramElementAttributes;
    diagram_data: DiagramEdge;
    editable: boolean;
    draftEdge: DiagramEdge;
    handleAddAttribute: HandleAddAttribute;
    handleRemoveLocal: HandleRemoveLocal;
    handleRenewAttribute: HandleRenewAttribute;
}

export function buildDefaultEdgeFieldGroups({
    diagram_attributes,
    diagram_data,
    editable,
    draftEdge,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
}: BuildDefaultEdgeFieldGroupsProps): CustomFieldGroup[] {
    const isArchitectureEdge = draftEdge?.data?.type === CanvasNodeType.architecture.toString();
    return [
        {
            title: "Data",
            tab_value: "data",
            default_expanded: true,
            fields: [
                {
                    attributes: diagram_attributes?.data || [],
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
                    disable_add: !isArchitectureEdge,
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
