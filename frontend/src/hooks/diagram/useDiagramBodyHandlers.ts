import React from "react";

import {
    Connection,
    HandleType,
    OnConnectStartParams,
    ReactFlowInstance,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import { enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAddNewNodesToDiagram,
    useAppendCanvasHistory,
    useDeselectAllNodesAndEdges,
    useDraggableEdgeActions,
    useHandleSetProcessedEdges,
    useHandleSetProcessedNodes,
    usePersistCanvas,
    useReloadNodeHandleEdgeMappingList,
    useUpdateSelectedNodeIdList,
} from "#root/hooks/diagram";
import { CanvasEdgeType, CanvasType, DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import type { DrawerState } from "#root/interfaces/diagramContent";
import { LineSegmentResolver } from "#root/lib/LineSegmentResolver";
import { getProjectDiagramIsAuthorizedFromStore } from "#root/stores/backendAuthStore";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
    getDiagramDraftCanvasViewOnlyFromStore,
    getDiagramOverlayNodesFromStore,
    getIsProjectCqCompletedFromStore,
    setDiagramCanvasInit,
    setDiagramDraftCanvasEdges,
    setDiagramDraftCanvasNodes,
} from "#root/stores/projectDiagram/canvas";
import { getDiagramCanvasHistoryFromStore } from "#root/stores/projectDiagram/canvasHistory";
import {
    setDiagramIsConnecting,
    setDiagramIsConnectingHandleType,
} from "#root/stores/projectDiagram/connection";
import { setDiagramDrawerState } from "#root/stores/projectDiagram/drawer";
import { getFilteredCanvasNodesOrEdges } from "#root/utils/diagram";
import {
    getNewEdgeOnConnect,
    resolveConnectionParams,
    verifyConnect,
} from "#root/utils/diagram/diagramCanvasConnectionUtil";
import {
    openAuthorizationWarningSnackbar,
    updateLineSegments,
} from "#root/utils/diagram/diagramCanvasInteractionUtil";
import {
    checkInitialNodeDropConditions,
    getNodeAttributesFromEventData,
    getSpecificNewNodeOnDrop,
} from "#root/utils/diagram/diagramCanvasNodeFactoryUtil";
import {
    checkIfNodeParentChildCardRefKeyPairAllowed,
    checkIfNodeParentChildIconPairAllowed,
    checkIfNodePositionChanged,
    updateCanvasNodesOnNodeDragStop,
    updateNodeAttributes,
} from "#root/utils/diagram/diagramCanvasNodeGroupUtil";
import { checkIfNodeOverlap } from "#root/utils/diagram/diagramNodeUtil";

import { useDiagramBiDirectionalArrow } from "./projectDiagramFeatureHooks";
import { useDiagramCanvasHandlerRollback } from "./useDiagramCanvasHandlerRollback";

export const useDiagramBodyHandlers = () => {
    const instanceId = useDiagramInstanceId();
    const biDirectionalArrow = useDiagramBiDirectionalArrow();
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const addNewNodesToDiagram = useAddNewNodesToDiagram();
    const handleSetProcessedEdges = useHandleSetProcessedEdges();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const persistCanvas = usePersistCanvas();
    const appendCanvasHistory = useAppendCanvasHistory();
    const deselectAllNodesAndEdges = useDeselectAllNodesAndEdges();
    const setSelectedNodeIdList = useUpdateSelectedNodeIdList();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const reloadNodeHandleEdgeMappingList = useReloadNodeHandleEdgeMappingList();

    const setEdges = React.useCallback(
        (value: React.SetStateAction<DiagramEdge[]>) =>
            setDiagramDraftCanvasEdges(value, instanceId),
        [instanceId]
    );
    const setNodes = React.useCallback(
        (value: React.SetStateAction<DiagramNode[]>) =>
            setDiagramDraftCanvasNodes(value, instanceId),
        [instanceId]
    );
    const canEditCanvasFromStore = React.useCallback(() => {
        const projectDiagramIsAuthorized = getProjectDiagramIsAuthorizedFromStore();
        const selectedCanvasViewOnly = getDiagramDraftCanvasViewOnlyFromStore(instanceId);

        if (!projectDiagramIsAuthorized?.update) {
            openAuthorizationWarningSnackbar();
            return false;
        }

        if (selectedCanvasViewOnly) {
            const isSubmitted = !!getDiagramDraftCanvasFromStore(instanceId)?.view_only;
            enqueueSnackbar(
                !getIsProjectCqCompletedFromStore()
                    ? "Submit the Conception Questionnaire to unlock diagram editing."
                    : isSubmitted
                      ? "The diagram has been submitted and is locked."
                      : "The diagram is currently locked.",
                { preventDuplicate: true, variant: "info" }
            );
            return false;
        }

        return true;
    }, [instanceId]);

    const canvasNodesRef = React.useRef<DiagramNode[]>([]);
    const canvasEdgesRef = React.useRef<DiagramEdge[]>([]);
    const reactFlowInstanceRef = React.useRef<ReactFlowInstance<DiagramNode, DiagramEdge> | null>(
        null
    );
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { runCanvasHandlerWithRollback } = useDiagramCanvasHandlerRollback({
        instanceId,
        canvasNodesRef,
        canvasEdgesRef,
        reactFlowInstanceRef,
    });

    const onDragOver = React.useCallback(
        (event: React.DragEvent) => {
            void runCanvasHandlerWithRollback("onDragOver", () => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
            });
        },
        [runCanvasHandlerWithRollback]
    );

    const onConnectStart = React.useCallback(
        (_event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
            void runCanvasHandlerWithRollback("onConnectStart", () => {
                setDiagramIsConnecting(true, instanceId);
                setDiagramIsConnectingHandleType(params.handleType || "source", instanceId);
            });
        },
        [instanceId, runCanvasHandlerWithRollback]
    );

    const onReconnectStart = React.useCallback(
        (
            _event: React.MouseEvent<Element, MouseEvent>,
            _edge: DiagramEdge,
            handleType: HandleType
        ) => {
            void runCanvasHandlerWithRollback("onReconnectStart", () => {
                setDiagramIsConnecting(true, instanceId);
                setDiagramIsConnectingHandleType(handleType, instanceId);
            });
        },
        [instanceId, runCanvasHandlerWithRollback]
    );

    const onConnectEnd = React.useCallback(() => {
        void runCanvasHandlerWithRollback("onConnectEnd", () => {
            setDiagramIsConnecting(false, instanceId);
        });
    }, [instanceId, runCanvasHandlerWithRollback]);

    const onReconnectEnd = onConnectEnd;

    const onEdgesChange = React.useCallback(
        (changes: Parameters<typeof applyEdgeChanges<DiagramEdge>>[0]) => {
            if (changes.length > 0 && changes.every((change) => change.type === "select")) {
                setEdges((currentEdges) => applyEdgeChanges<DiagramEdge>(changes, currentEdges));
                return;
            }

            void runCanvasHandlerWithRollback("onEdgesChange", () => {
                if (!canEditCanvasFromStore()) return;
                setEdges((currentEdges) => applyEdgeChanges<DiagramEdge>(changes, currentEdges));
            });
        },
        [canEditCanvasFromStore, runCanvasHandlerWithRollback, setEdges]
    );

    const onNodesChange = React.useCallback(
        (changes: Parameters<typeof applyNodeChanges<DiagramNode>>[0]) => {
            if (changes.length > 0 && changes.every((change) => change.type === "select")) {
                setNodes((currentNodes) => applyNodeChanges<DiagramNode>(changes, currentNodes));
                return;
            }

            void runCanvasHandlerWithRollback("onNodesChange", () => {
                if (!canEditCanvasFromStore()) return;
                setNodes((currentNodes) => applyNodeChanges<DiagramNode>(changes, currentNodes));
            });
        },
        [canEditCanvasFromStore, runCanvasHandlerWithRollback, setNodes]
    );

    const onReconnect = React.useCallback(
        async (oldEdge: DiagramEdge, params: Connection) => {
            await runCanvasHandlerWithRollback("onReconnect", async () => {
                if (!canEditCanvasFromStore()) return;
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
                const contextEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
                const overlayNodes = getDiagramOverlayNodesFromStore(instanceId);
                const edgeNodes = contextNodes;
                const allNodes = [...overlayNodes, ...contextNodes];
                const resolvedParams = resolveConnectionParams(params, allNodes);
                const canvasNodes = contextNodes;

                if (
                    !resolvedParams.source ||
                    !resolvedParams.target ||
                    !resolvedParams.sourceHandle ||
                    !resolvedParams.targetHandle ||
                    !currentSelectedCanvas
                ) {
                    enqueueSnackbar("One or more mandatory edge properties are undefined.", {
                        variant: "error",
                    });
                    return;
                }
                if (
                    !allNodes.some((node) => node.id === resolvedParams.source) ||
                    !allNodes.some((node) => node.id === resolvedParams.target)
                ) {
                    enqueueSnackbar("Failed to add the connected nodes into the draft canvas.", {
                        variant: "error",
                    });
                    return;
                }
                const filteredEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                    contextEdges,
                    currentSelectedCanvas.canvas_type
                );
                const selectedEdgeType =
                    CanvasEdgeType?.[
                        currentSelectedCanvas.canvas_type as keyof typeof CanvasEdgeType
                    ];
                if (
                    !verifyConnect({
                        edges: filteredEdges,
                        nodes: allNodes,
                        oldEdge,
                        params: resolvedParams,
                        selectedEdgeType,
                    })
                ) {
                    return;
                }

                const newEdge: DiagramEdge = {
                    ...oldEdge,
                    source: resolvedParams.source ?? "",
                    sourceHandle: resolvedParams.sourceHandle,
                    target: resolvedParams.target ?? "",
                    targetHandle: resolvedParams.targetHandle,
                };

                const edgesOnCanvas = structuredClone([
                    ...(contextEdges || []).filter((edge) => edge.id !== oldEdge.id),
                    newEdge,
                ]);

                resetOverlappingLineSegments(edgesOnCanvas, oldEdge, allNodes);
                resetOverlappingLineSegments(edgesOnCanvas, newEdge, allNodes);

                const nodeHandleEdgeMapping = await reloadNodeHandleEdgeMappingList({
                    nodes: edgeNodes,
                    edges: edgesOnCanvas,
                });
                const lineSegmentResolver = new LineSegmentResolver(
                    allNodes,
                    nodeHandleEdgeMapping
                );
                const canvasEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                    edgesOnCanvas,
                    currentSelectedCanvas.canvas_type
                )?.map((edge) => ({
                    ...edge,
                    data: {
                        ...edge?.data,
                        lineSegments:
                            edge?.id === newEdge?.id
                                ? lineSegmentResolver.computeLineSegments({ edge })
                                : (edge?.data?.lineSegments ?? []),
                    },
                }));

                handleSetProcessedNodes({
                    canvasNodes,
                    funcRef: "onReconnect",
                    skipRefreshNodeHandleEdgeMappingList: true,
                });
                handleSetProcessedEdges({
                    canvasEdges,
                    funcRef: "onReconnect",
                    skipRefreshNodeEdgeMappingList: true,
                });
                await persistCanvas({
                    canvasNodes,
                    canvasEdges,
                    draftCanvasId: currentSelectedCanvas.canvas_id,
                });
            });
        },
        [
            handleSetProcessedEdges,
            handleSetProcessedNodes,
            instanceId,
            canEditCanvasFromStore,
            persistCanvas,
            reloadNodeHandleEdgeMappingList,
            resetOverlappingLineSegments,
            runCanvasHandlerWithRollback,
        ]
    );

    const onConnect = React.useCallback(
        async (params: Connection | DiagramEdge) => {
            await runCanvasHandlerWithRollback("onConnect", async () => {
                if (!canEditCanvasFromStore()) return;
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
                const contextEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
                const overlayNodes = getDiagramOverlayNodesFromStore(instanceId);
                const edgeNodes = contextNodes;
                const allNodes = [...overlayNodes, ...contextNodes];
                const resolvedParams = resolveConnectionParams(params, allNodes);

                if (
                    !resolvedParams.source ||
                    !resolvedParams.target ||
                    !resolvedParams.sourceHandle ||
                    !resolvedParams.targetHandle ||
                    !currentSelectedCanvas
                ) {
                    enqueueSnackbar("One or more mandatory edge properties are undefined.", {
                        variant: "error",
                    });
                    return;
                }
                const filteredEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                    contextEdges,
                    currentSelectedCanvas.canvas_type
                );
                const selectedEdgeType =
                    CanvasEdgeType?.[
                        currentSelectedCanvas.canvas_type as keyof typeof CanvasEdgeType
                    ];
                if (
                    !verifyConnect({
                        edges: filteredEdges,
                        nodes: allNodes,
                        params: resolvedParams,
                        selectedEdgeType,
                    })
                ) {
                    return;
                }

                const newEdge = getNewEdgeOnConnect({
                    params: resolvedParams,
                    selectedEdgeType,
                    selectedCanvasRef: currentSelectedCanvas.ref,
                    biDirectionalArrow,
                });
                if (!newEdge) {
                    enqueueSnackbar("Failed to retrieve new edge.", {
                        variant: "error",
                    });
                    return;
                }

                const edgesOnCanvas = structuredClone([...contextEdges, newEdge]);
                resetOverlappingLineSegments(edgesOnCanvas as DiagramEdge[], newEdge, allNodes);

                const nodeHandleEdgeMapping = reloadNodeHandleEdgeMappingList({
                    nodes: edgeNodes,
                    edges: edgesOnCanvas,
                });
                const lineSegmentResolver = new LineSegmentResolver(
                    allNodes,
                    nodeHandleEdgeMapping
                );
                const canvasEdges = getFilteredCanvasNodesOrEdges<DiagramEdge>(
                    edgesOnCanvas as DiagramEdge[],
                    currentSelectedCanvas.canvas_type
                )?.map((edge) => ({
                    ...edge,
                    data: {
                        ...edge?.data,
                        lineSegments:
                            edge?.id === newEdge?.id
                                ? lineSegmentResolver.computeLineSegments({ edge })
                                : edge?.data?.lineSegments || [],
                    },
                }));
                handleSetProcessedEdges({
                    canvasEdges,
                    funcRef: "onConnect",
                    skipRefreshNodeEdgeMappingList: true,
                });
                await persistCanvas({
                    canvasEdges,
                    draftCanvasId: currentSelectedCanvas.canvas_id,
                });
            });
        },
        [
            biDirectionalArrow,
            canEditCanvasFromStore,
            handleSetProcessedEdges,
            instanceId,
            persistCanvas,
            reloadNodeHandleEdgeMappingList,
            resetOverlappingLineSegments,
            runCanvasHandlerWithRollback,
        ]
    );

    const onInit = React.useCallback(
        (reactFlowInstance: ReactFlowInstance<DiagramNode, DiagramEdge>) => {
            void runCanvasHandlerWithRollback("onInit", () => {
                reactFlowInstanceRef.current = reactFlowInstance;
                setDiagramCanvasInit(true, instanceId);
            });
        },
        [instanceId, reactFlowInstanceRef, runCanvasHandlerWithRollback]
    );

    const onDrop = React.useCallback(
        async (event: React.DragEvent) => {
            await runCanvasHandlerWithRollback("onDrop", async () => {
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);

                if (!currentSelectedCanvas) throw new Error("No selected canvas.");

                if (!canEditCanvasFromStore()) return;
                event.preventDefault();
                const nodeAttributes = getNodeAttributesFromEventData(event);
                if (
                    !checkInitialNodeDropConditions({
                        node_attributes: nodeAttributes,
                        selectedCanvasType: currentSelectedCanvas.canvas_type,
                    })
                ) {
                    return;
                }

                const { screenToFlowPosition } = reactFlow;
                const position = screenToFlowPosition(
                    { x: event.clientX, y: event.clientY },
                    { snapToGrid: true }
                );

                const node = getSpecificNewNodeOnDrop({
                    node_attributes: nodeAttributes,
                    node_count: contextNodes?.length || 0,
                    position,
                });
                if (!node) {
                    throw new Error("Failed to create new node.");
                }

                const { parentNode } = updateNodeAttributes({
                    node,
                    allNodes: contextNodes,
                    positionAbsolute: position,
                });
                checkIfNodeParentChildIconPairAllowed(node, parentNode);
                checkIfNodeParentChildCardRefKeyPairAllowed(node, parentNode);

                await addNewNodesToDiagram([node]);
            });
        },
        [
            addNewNodesToDiagram,
            canEditCanvasFromStore,
            instanceId,
            reactFlow,
            runCanvasHandlerWithRollback,
        ]
    );

    const onNodeClick = React.useCallback(
        (event: React.MouseEvent, node: DiagramNode) => {
            void runCanvasHandlerWithRollback("onNodeClick", () => {
                const effectiveViewOnly = getDiagramDraftCanvasViewOnlyFromStore(instanceId);
                const draftCanvasNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
                const editableNode = draftCanvasNodes.find((draftNode) => draftNode.id === node.id);

                if (effectiveViewOnly) {
                    deselectAllNodesAndEdges();
                    return;
                }

                if (event.detail === 2 && !!editableNode?.id) {
                    setSelectedNodeIdList([editableNode.id]);
                    setDiagramDrawerState(
                        (prev: DrawerState) => ({ ...prev, node_info: true }),
                        instanceId
                    );
                }
            });
        },
        [deselectAllNodesAndEdges, instanceId, runCanvasHandlerWithRollback, setSelectedNodeIdList]
    );

    const onEdgeClick = React.useCallback(
        (event: React.MouseEvent, edge: DiagramEdge) => {
            void runCanvasHandlerWithRollback("onEdgeClick", () => {
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const isEdgeSelectable = edge.selectable !== false;
                const effectiveViewOnly = getDiagramDraftCanvasViewOnlyFromStore(instanceId);

                if (
                    (effectiveViewOnly &&
                        currentSelectedCanvas?.canvas_type !== CanvasType.summary) ||
                    !isEdgeSelectable
                ) {
                    deselectAllNodesAndEdges();
                    return;
                }

                if (event.detail === 2) {
                    setDiagramDrawerState(
                        (prev: DrawerState) => ({ ...prev, edge_info: true }),
                        instanceId
                    );
                }
            });
        },
        [deselectAllNodesAndEdges, instanceId, runCanvasHandlerWithRollback]
    );

    const onNodeDragStart = React.useCallback(
        (_event: MouseEvent | TouchEvent, _node: DiagramNode) => {
            void runCanvasHandlerWithRollback("onNodeDragStart", () => {
                if (!canEditCanvasFromStore()) return;
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);

                if (!currentSelectedCanvas) return;
                canvasNodesRef.current = currentSelectedCanvas.nodes;
                canvasEdgesRef.current = currentSelectedCanvas.edges;
                const canvasHistory = getDiagramCanvasHistoryFromStore(instanceId);
                if (!canvasHistory.length) {
                    appendCanvasHistory(currentSelectedCanvas);
                }
            });
        },
        [appendCanvasHistory, canEditCanvasFromStore, instanceId, runCanvasHandlerWithRollback]
    );

    const onNodeDragStop = React.useCallback(
        async (
            _event: MouseEvent | TouchEvent,
            _changedNode: DiagramNode,
            changedNodes: DiagramNode[]
        ) => {
            await runCanvasHandlerWithRollback("onNodeDragStop", async () => {
                if (!canEditCanvasFromStore()) return;
                const currentSelectedCanvas = getDiagramDraftCanvasFromStore(instanceId);
                const contextNodes = getDiagramDraftCanvasNodesFromStore(instanceId);

                if (!currentSelectedCanvas) {
                    throw new Error("No selected canvas.");
                } else if (!canvasNodesRef.current) {
                    throw new Error("Reference nodes not set.");
                } else if (!changedNodes?.length) {
                    throw new Error("Nodes are unchanged.");
                }

                const canvasNodes = structuredClone(canvasNodesRef.current);
                changedNodes.forEach((changedNode) => {
                    if (
                        !checkIfNodePositionChanged({
                            allNodes: contextNodes,
                            changedNode,
                            refNodes: canvasNodesRef.current,
                            reactFlow,
                        })
                    ) {
                        return;
                    }

                    checkIfNodeOverlap({
                        allNodes: contextNodes,
                        changedNode,
                    });

                    updateCanvasNodesOnNodeDragStop({
                        allNodes: contextNodes,
                        canvasNodes,
                        changedNode,
                        reactFlow,
                    });
                    updateLineSegments({
                        instanceId,
                        changedNode,
                        canvasNodes,
                        edges: currentSelectedCanvas.edges,
                        allNodes: contextNodes,
                    });
                });

                handleSetProcessedNodes({
                    canvasNodes,
                    funcRef: "onNodeDragStop",
                });
                await persistCanvas({
                    canvasNodes,
                    draftCanvasId: currentSelectedCanvas.canvas_id,
                });
            });
        },
        [
            handleSetProcessedNodes,
            instanceId,
            canEditCanvasFromStore,
            persistCanvas,
            reactFlow,
            runCanvasHandlerWithRollback,
        ]
    );

    const onPaneClick = React.useCallback(
        (_event: React.MouseEvent) => {
            deselectAllNodesAndEdges();
        },
        [deselectAllNodesAndEdges]
    );

    return {
        containerRef,
        onDragOver,
        onConnectStart,
        onReconnectStart,
        onConnectEnd,
        onReconnectEnd,
        onEdgesChange,
        onNodesChange,
        onReconnect,
        onConnect,
        onInit,
        onDrop,
        onNodeClick,
        onEdgeClick,
        onNodeDragStart,
        onNodeDragStop,
        onPaneClick,
    };
};
