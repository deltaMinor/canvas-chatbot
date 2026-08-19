import React from "react";

import { dialogConfirmStateKeys } from "#root/constants/diagramDrawerNode";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    useHandleSetProcessedNodes,
    useSetDiagramDraftNode,
    useSetDiagramDraftNodeAttributes,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import {
    DiagramElementAttrBaseFieldKey,
    DiagramElementType,
} from "#root/interfaces/diagramAttributes";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { getDiagramDraftCanvasTypeFromStore } from "#root/stores/projectDiagram/canvas";
import {
    getDiagramDraftNodeFromStore,
    getDiagramIsNodeDrawerDirtyFromStore,
    setDiagramDrawerState,
} from "#root/stores/projectDiagram/drawer";
import { stripDiagramElementAttributes } from "#root/utils/diagram/diagramAttributeUtil";
import {
    getNodeAttributes,
    processAddDrawerNodeAttribute,
    processAddNodeAttribute,
    processRemoveAttrDrawerNode,
    processRenewNodeAttribute,
    processSaveNode,
    processUpdateAttrDrawerNode,
} from "#root/utils/diagram/diagramDrawerNodeUtil";

export const useReloadNodeAttributes = () => {
    const instanceId = useDiagramInstanceId();
    const setDraftNodeAttributes = useSetDiagramDraftNodeAttributes();

    return React.useCallback(
        async (_draftNode?: DiagramNode) => {
            const selectedCanvasType = getDiagramDraftCanvasTypeFromStore(instanceId);
            const nextDraftNode = _draftNode ?? getDiagramDraftNodeFromStore(instanceId);
            const isNodeEditable = selectedCanvasType === nextDraftNode?.data?.type;
            const { nodeAttributes: nodeAttributes } = getNodeAttributes({
                draftNode: nextDraftNode,
                isNodeEditable,
            });
            setDraftNodeAttributes(stripDiagramElementAttributes(nodeAttributes));
        },
        [instanceId, setDraftNodeAttributes]
    );
};

export const useResetNodeAttributes = () => {
    const setDraftNodeAttributes = useSetDiagramDraftNodeAttributes();

    return React.useCallback(() => {
        setDraftNodeAttributes(null);
    }, [setDraftNodeAttributes]);
};

export const useAddDrawerNodeAttribute = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeAttributes = useReloadNodeAttributes();
    const setDraftNode = useSetDiagramDraftNode();

    return React.useCallback(
        async (baseAttrKey: string, data: { [key: string]: unknown }) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processAddDrawerNodeAttribute({
                        instanceId,
                        baseAttrKey,
                        data,
                        reloadNodeAttributes,
                        setDraftNode,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadNodeAttributes, setDraftNode]
    );
};

export const useDeleteDrawerNode = () => {
    return React.useCallback(async () => {
        handleOpenDialog(dialogConfirmStateKeys.deleteNode);
    }, []);
};

export const useRenewNodeAttribute = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeAttributes = useReloadNodeAttributes();
    const setDraftNode = useSetDiagramDraftNode();

    return React.useCallback(
        async (property: DiagramElementAttrBaseFieldKey, attributeKey: string) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processRenewNodeAttribute({
                        instanceId,
                        property,
                        attributeKey,
                        reloadNodeAttributes,
                        setDraftNode,
                    });
                },
                message: "Renewing attribute...",
                messageOnSuccess: "Attribute renewed successfully",
            });
        },
        [instanceId, reloadNodeAttributes, setDraftNode]
    );
};

export const useAddNodeAttribute = () => {
    const instanceId = useDiagramInstanceId();
    return React.useCallback(
        async (attributeSetType: DiagramElementType) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processAddNodeAttribute({
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

export const useRemoveAttrDrawerNode = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeAttributes = useReloadNodeAttributes();
    const setDraftNode = useSetDiagramDraftNode();

    return React.useCallback(
        async (baseAttrKey: string, attrKey: string) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processRemoveAttrDrawerNode({
                        instanceId,
                        baseAttrKey,
                        attrKey,
                        reloadNodeAttributes,
                        setDraftNode,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadNodeAttributes, setDraftNode]
    );
};

export const useUpdateDrawerNode = () => {
    const instanceId = useDiagramInstanceId();
    const reloadNodeAttributes = useReloadNodeAttributes();
    const setDraftNode = useSetDiagramDraftNode();

    return React.useCallback(
        async (baseAttrKey: string, data: { [key: string]: unknown }) => {
            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processUpdateAttrDrawerNode({
                        instanceId,
                        baseAttrKey,
                        data,
                        reloadNodeAttributes,
                        setDraftNode,
                    });
                },
                disableMessage: true,
                disableMessageOnSuccess: true,
            });
        },
        [instanceId, reloadNodeAttributes, setDraftNode]
    );
};

export const useVerifyCloseNodeDrawer = () => {
    const instanceId = useDiagramInstanceId();
    const handleCloseNodeInfoDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                node_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    return React.useCallback(async () => {
        const isNodeDrawerDirty = getDiagramIsNodeDrawerDirtyFromStore(instanceId);
        if (isNodeDrawerDirty) {
            handleOpenDialog(dialogConfirmStateKeys.closeDrawerNode);
            return;
        }

        return await handleCloseNodeInfoDrawer();
    }, [handleCloseNodeInfoDrawer, instanceId]);
};

export const useSaveDrawerNode = () => {
    const instanceId = useDiagramInstanceId();
    const handleSetProcessedNodes = useHandleSetProcessedNodes();
    const handleCloseNodeInfoDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                node_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    return React.useCallback(
        async (draftNodeOverride?: DiagramNode | null) => {
            await handleCloseNodeInfoDrawer();

            return await CallApiWithSnackbar({
                async_func: async () => {
                    return await processSaveNode({
                        instanceId,
                        handleSetProcessedNodes,
                        ...(draftNodeOverride ? { draftNodeOverride } : {}),
                    });
                },
                message: "Saving ...",
            });
        },
        [handleCloseNodeInfoDrawer, handleSetProcessedNodes, instanceId]
    );
};
