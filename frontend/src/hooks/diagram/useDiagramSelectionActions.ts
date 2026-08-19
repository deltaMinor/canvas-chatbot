import React from "react";

import { useStoreApi } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    getDiagramDraftCanvasEdgesFromStore,
    getDiagramDraftCanvasFromStore,
    getDiagramDraftCanvasNodesFromStore,
} from "#root/stores/projectDiagram/canvas";
import {
    getDiagramSelectedEdgeIdListFromStore,
    getDiagramSelectedNodeIdListFromStore,
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";

export const useUpdateSelectedNodeIdList = () => {
    const instanceId = useDiagramInstanceId();
    const store = useStoreApi();

    return React.useCallback(
        (nodeIdList: string[]) => {
            store.getState().addSelectedNodes(nodeIdList);
            setDiagramSelectedNodeIdList(nodeIdList, instanceId);
        },
        [instanceId, store]
    );
};

export const useUpdateSelectedEdgeIdList = () => {
    const instanceId = useDiagramInstanceId();
    const store = useStoreApi();

    return React.useCallback(
        (edgeIdList: string[]) => {
            store.getState().addSelectedEdges(edgeIdList);
            setDiagramSelectedEdgeIdList(edgeIdList, instanceId);
        },
        [instanceId, store]
    );
};

export const useSelectAllNodes = () => {
    const instanceId = useDiagramInstanceId();
    const store = useStoreApi();

    return React.useCallback(() => {
        const diagramNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
        const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);
        const nextSelectedNodeIdList =
            diagramNodes
                ?.filter((node) => node?.data?.type === draftCanvas?.canvas_type)
                ?.map((node) => node.id) || [];

        store.getState().addSelectedNodes(nextSelectedNodeIdList);
        setDiagramSelectedNodeIdList(nextSelectedNodeIdList, instanceId);
    }, [instanceId, store]);
};

export const useSelectAllEdges = () => {
    const instanceId = useDiagramInstanceId();
    const store = useStoreApi();

    return React.useCallback(() => {
        const diagramEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
        const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);
        const nextSelectedEdgeIdList =
            diagramEdges
                ?.filter((edge) => edge?.data?.type === draftCanvas?.canvas_type)
                ?.map((edge) => edge.id) || [];

        store.getState().addSelectedEdges(nextSelectedEdgeIdList);
        setDiagramSelectedEdgeIdList(nextSelectedEdgeIdList, instanceId);
    }, [instanceId, store]);
};

export const useSelectAllNodesAndEdges = () => {
    const store = useStoreApi();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        const diagramNodes = getDiagramDraftCanvasNodesFromStore(instanceId);
        const diagramEdges = getDiagramDraftCanvasEdgesFromStore(instanceId);
        const draftCanvas = getDiagramDraftCanvasFromStore(instanceId);
        const nextSelectedNodeIdList =
            diagramNodes
                ?.filter((node) => node?.data?.type === draftCanvas?.canvas_type)
                ?.map((node) => node.id) || [];
        const nextSelectedEdgeIdList = diagramEdges.map((edge) => edge.id);

        store.getState().addSelectedNodes(nextSelectedNodeIdList);
        store.getState().addSelectedEdges(nextSelectedEdgeIdList);
        setDiagramSelectedNodeIdList(nextSelectedNodeIdList, instanceId);
        setDiagramSelectedEdgeIdList(nextSelectedEdgeIdList, instanceId);
    }, [instanceId, store]);
};

export const useDeselectAllNodes = () => {
    const store = useStoreApi();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        const selectedEdgeIdList = getDiagramSelectedEdgeIdListFromStore(instanceId);
        store.getState().unselectNodesAndEdges();
        if (selectedEdgeIdList.length) {
            store.getState().addSelectedEdges(selectedEdgeIdList);
        }
        setDiagramSelectedNodeIdList([], instanceId);
        setDiagramSelectedEdgeIdList(selectedEdgeIdList, instanceId);
    }, [instanceId, store]);
};

export const useDeselectAllEdges = () => {
    const store = useStoreApi();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        const selectedNodeIdList = getDiagramSelectedNodeIdListFromStore(instanceId);
        store.getState().unselectNodesAndEdges();
        if (selectedNodeIdList.length) {
            store.getState().addSelectedNodes(selectedNodeIdList);
        }
        setDiagramSelectedNodeIdList(selectedNodeIdList, instanceId);
        setDiagramSelectedEdgeIdList([], instanceId);
    }, [instanceId, store]);
};

export const useDeselectAllNodesAndEdges = () => {
    const store = useStoreApi();
    const instanceId = useDiagramInstanceId();

    return React.useCallback(() => {
        store.getState().unselectNodesAndEdges();
        setDiagramSelectedNodeIdList([], instanceId);
        setDiagramSelectedEdgeIdList([], instanceId);
    }, [instanceId, store]);
};
