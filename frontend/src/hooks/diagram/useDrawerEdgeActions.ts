import React from "react";

import { dialogConfirmStateKeys } from "#root/constants/diagramDrawerEdge";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useAppendCanvasHistory,
    useHandleSetProcessedEdges,
    useSetDiagramDraftEdge,
    useSetDiagramDraftEdgeAttributes,
} from "#root/hooks/diagram";
import { DiagramEdge } from "#root/interfaces/diagram";
import { DiagramElementType } from "#root/interfaces/diagramAttributes";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { getDiagramDraftCanvasTypeFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getDiagramDraftEdgeFromStore,
    getDiagramIsEdgeDrawerDirtyFromStore,
    setDiagramDrawerState,
} from "#root/stores/projectDiagram/drawer";
import { stripDiagramElementAttributes } from "#root/utils/diagram/diagramAttributeUtil";
import {
    getEdgeAttributes,
    processAddDrawerEdgeAttribute,
    processAddDrawerEdgeMarker,
    processAddEdgeAttribute,
    processRemoveAttrDrawerEdge,
    processSaveEdge,
    processUpdateDrawerEdge,
} from "#root/utils/diagram/diagramDrawerEdgeUtil";

export const useReloadEdgeAttributes = () => {
    const instanceId = useDiagramInstanceId();
    const setDraftEdgeAttributes = useSetDiagramDraftEdgeAttributes();

    return React.useCallback(
        async (_draftEdge?: DiagramEdge) => {
            const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
            const nextDraftEdge = _draftEdge ?? getDiagramDraftEdgeFromStore(instanceId);
            const isEdgeEditable = selectedCanvasType === nextDraftEdge?.data?.type;
            const { edgeAttributes: edgeAttributes } = getEdgeAttributes({
                draftEdge: nextDraftEdge,
                isEdgeEditable,
            });
            setDraftEdgeAttributes(stripDiagramElementAttributes(edgeAttributes));
        },
        [instanceId, setDraftEdgeAttributes]
    );
};

export const useResetEdgeAttributes = () => {
    const setDraftEdgeAttributes = useSetDiagramDraftEdgeAttributes();

    return React.useCallback(() => {
        setDraftEdgeAttributes(null);
    }, [setDraftEdgeAttributes]);
};

export const useAddDrawerEdgeAttribute = () => {
    const instanceId = useDiagramInstanceId();
    const reloadEdgeAttributes = useReloadEdgeAttributes();
    const setDraftEdge = useSetDiagramDraftEdge();

    return React.useCallback(
        async (baseAttrKey: string, data: { [key: string]: unknown }) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processAddDrawerEdgeAttribute({
                        instanceId,
                        baseAttrKey,
                        data,
                        reloadEdgeAttributes,
                        setDraftEdge,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadEdgeAttributes, setDraftEdge]
    );
};

export const useAddDrawerEdgeMarker = () => {
    const instanceId = useDiagramInstanceId();
    const reloadEdgeAttributes = useReloadEdgeAttributes();
    const setDraftEdge = useSetDiagramDraftEdge();

    return React.useCallback(
        async (markerKey: string, data: { [key: string]: unknown }) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processAddDrawerEdgeMarker({
                        instanceId,
                        markerKey,
                        data,
                        reloadEdgeAttributes,
                        setDraftEdge,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadEdgeAttributes, setDraftEdge]
    );
};

export const useDeleteDrawerEdge = () => {
    return React.useCallback(async () => {
        handleOpenDialog(dialogConfirmStateKeys.deleteEdge);
    }, []);
};

export const useRenewEdgeAttribute = () => {
    return React.useCallback(async () => {}, []);
};

export const useAddEdgeAttribute = () => {
    const instanceId = useDiagramInstanceId();
    return React.useCallback(
        async (attributeSetType: DiagramElementType) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processAddEdgeAttribute({
                        instanceId,
                        attributeSetType,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId]
    );
};

export const useRemoveAttrDrawerEdge = () => {
    const instanceId = useDiagramInstanceId();
    const reloadEdgeAttributes = useReloadEdgeAttributes();
    const setDraftEdge = useSetDiagramDraftEdge();

    return React.useCallback(
        async (baseAttrKey: string, attrKey: string) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processRemoveAttrDrawerEdge({
                        instanceId,
                        baseAttrKey,
                        attrKey,
                        reloadEdgeAttributes,
                        setDraftEdge,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadEdgeAttributes, setDraftEdge]
    );
};

export const useUpdateDrawerEdge = () => {
    const instanceId = useDiagramInstanceId();
    const reloadEdgeAttributes = useReloadEdgeAttributes();
    const setDraftEdge = useSetDiagramDraftEdge();

    return React.useCallback(
        async (baseAttrKey: string, data: { [key: string]: unknown }) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processUpdateDrawerEdge({
                        instanceId,
                        baseAttrKey,
                        data,
                        reloadEdgeAttributes,
                        setDraftEdge,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadEdgeAttributes, setDraftEdge]
    );
};

export const useVerifyCloseEdgeDrawer = () => {
    const instanceId = useDiagramInstanceId();
    const handleCloseEdgeInfoDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                edge_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    return React.useCallback(async () => {
        const isEdgeDrawerDirty = getDiagramIsEdgeDrawerDirtyFromStore(instanceId);
        if (isEdgeDrawerDirty) {
            handleOpenDialog(dialogConfirmStateKeys.closeDrawerEdge);
            return;
        }

        return await handleCloseEdgeInfoDrawer();
    }, [handleCloseEdgeInfoDrawer, instanceId]);
};

export const useSaveDrawerEdge = () => {
    const instanceId = useDiagramInstanceId();
    const appendCanvasHistory = useAppendCanvasHistory();
    const handleSetProcessedEdges = useHandleSetProcessedEdges();
    const handleCloseEdgeInfoDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                edge_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    return React.useCallback(
        async (draftEdgeOverride?: DiagramEdge | null) => {
            await handleCloseEdgeInfoDrawer();

            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processSaveEdge({
                        instanceId,
                        appendCanvasHistory,
                        handleSetProcessedEdges,
                        ...(draftEdgeOverride ? { draftEdgeOverride } : {}),
                    });
                },
                message: "Saving ...",
            });
        },
        [appendCanvasHistory, handleCloseEdgeInfoDrawer, handleSetProcessedEdges, instanceId]
    );
};
