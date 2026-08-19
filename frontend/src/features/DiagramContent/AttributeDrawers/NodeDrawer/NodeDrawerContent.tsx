import React from "react";

import AttributeDrawer from "#root/components/DiagramAttributeForm";
import DiagramDrawer from "#root/components/DiagramDrawer";
import { DEFAULT_ZINDEX_DIAGRAM_DRAWER } from "#root/constants/diagram";
import { drawerWidth } from "#root/constants/diagramAttributeDrawer";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { LogDialogStateEnum } from "#root/enums/dialog";
import {
    useDeleteDrawerNode,
    useDiagramCapabilitiesState,
    useDiagramDraftNodeLabel,
    useDiagramDraftNodeLoaded,
    useDiagramDrawerState,
    useIsNodeDeletable,
    useVerifyCloseNodeDrawer,
} from "#root/hooks/diagram";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { setDiagramDrawerState } from "#root/stores/projectDiagram/drawer";

import NodeDrawerBody from "./NodeDrawerBody";

const NodeDrawerContentComponent = () => {
    const drawerState = useDiagramDrawerState();
    const instanceId = useDiagramInstanceId();
    const draftNodeLabel = useDiagramDraftNodeLabel();
    const draftNodeLoaded = useDiagramDraftNodeLoaded();
    const capabilities = useDiagramCapabilitiesState();
    const isNodeDeletable = useIsNodeDeletable();
    const handleDeleteDrawerNode = useDeleteDrawerNode();
    const handleVerifyCloseNodeDrawer = useVerifyCloseNodeDrawer();
    const handleCloseNodeDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                node_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    /**
     * Opens the audit logs dialog for the current node.
     * Sets the selected node reference before opening the dialog.
     */
    const handleClickViewLogs = React.useCallback(async () => {
        handleOpenDialog(LogDialogStateEnum.projectDiagramNode);
    }, []);

    const menuOptions = React.useMemo(
        () => [
            ...(capabilities.toolbar.nodeDrawerLogs.enabled
                ? [
                      {
                          label: "View Logs",
                          onClick: handleClickViewLogs, // Opens LogDialogStateEnum.projectDiagramNode dialog
                      },
                  ]
                : []),
        ],
        [capabilities.toolbar.nodeDrawerLogs.enabled, handleClickViewLogs]
    );

    const headerActions = React.useMemo(
        () =>
            isNodeDeletable && capabilities.toolbar.nodeDrawerDelete.enabled ? (
                <AttributeDrawer.DeleteButton
                    title="Delete node"
                    ariaLabel="Delete node"
                    onClick={handleDeleteDrawerNode}
                />
            ) : null,
        [capabilities.toolbar.nodeDrawerDelete.enabled, handleDeleteDrawerNode, isNodeDeletable]
    );

    const handleHeaderCloseDrawer = React.useCallback(async () => {
        await handleVerifyCloseNodeDrawer();
    }, [handleVerifyCloseNodeDrawer]);

    return (
        <>
            <DiagramDrawer.Root
                anchor="right"
                drawerWidth={drawerWidth}
                joyrideClassName="joyride-node-attr-drawer"
                openDrawer={!!drawerState?.node_info}
                zIndex={DEFAULT_ZINDEX_DIAGRAM_DRAWER}
            >
                <DiagramDrawer.Header
                    title={draftNodeLoaded ? draftNodeLabel || "Node" : "Loading Node..."}
                    subtitle="Node Attribute Editor"
                    anchor="right"
                    actions={headerActions}
                    hideCloseDrawerButton
                    menuOptions={menuOptions}
                    handleCloseDrawer={handleHeaderCloseDrawer}
                />
                <DiagramDrawer.Body
                    loaded={draftNodeLoaded}
                    contentSx={{ overflowY: "hidden" }}
                >
                    <NodeDrawerBody onCancel={handleCloseNodeDrawer} />
                </DiagramDrawer.Body>
            </DiagramDrawer.Root>
        </>
    );
};

export default React.memo(NodeDrawerContentComponent);
