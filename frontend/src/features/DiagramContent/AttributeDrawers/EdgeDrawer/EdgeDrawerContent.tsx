import React from "react";

import AttributeDrawer from "#root/components/DiagramAttributeForm";
import DiagramDrawer from "#root/components/DiagramDrawer";
import { DEFAULT_ZINDEX_DIAGRAM_DRAWER } from "#root/constants/diagram";
import { drawerWidth } from "#root/constants/diagramAttributeDrawer";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { LogDialogStateEnum } from "#root/enums/dialog";
import {
    useDeleteDrawerEdge,
    useDiagramCapabilitiesState,
    useDiagramDraftEdgeLabel,
    useDiagramDraftEdgeLoaded,
    useDiagramDrawerState,
    useIsEdgeDeletable,
    useVerifyCloseEdgeDrawer,
} from "#root/hooks/diagram";
import { handleOpenDialog } from "#root/stores/dialogStore";
import { setDiagramDrawerState } from "#root/stores/projectDiagram/drawer";

import EdgeDrawerBody from "./EdgeDrawerBody";

interface EdgeDrawerContentProps {}

const EdgeDrawerContentComponent = (_: EdgeDrawerContentProps) => {
    const drawerState = useDiagramDrawerState();
    const draftEdgeLabel = useDiagramDraftEdgeLabel();
    const draftEdgeLoaded = useDiagramDraftEdgeLoaded();
    const instanceId = useDiagramInstanceId();
    const capabilities = useDiagramCapabilitiesState();
    const isEdgeDeletable = useIsEdgeDeletable();
    const handleDeleteDrawerEdge = useDeleteDrawerEdge();
    const handleVerifyCloseEdgeDrawer = useVerifyCloseEdgeDrawer();
    const handleCloseEdgeDrawer = React.useCallback(async () => {
        setDiagramDrawerState(
            (prev) => ({
                ...prev,
                edge_info: false,
            }),
            instanceId
        );
    }, [instanceId]);

    /**
     * Opens the audit logs dialog for the current edge.
     */
    const handleClickViewLogs = React.useCallback(async () => {
        handleOpenDialog(LogDialogStateEnum.projectDiagramEdge);
    }, []);

    const menuOptions = React.useMemo(
        () => [
            ...(capabilities.toolbar.edgeDrawerLogs.enabled
                ? [
                      {
                          label: "View Logs",
                          onClick: handleClickViewLogs, // Opens LogDialogStateEnum.projectDiagramEdge dialog
                      },
                  ]
                : []),
        ],
        [capabilities.toolbar.edgeDrawerLogs.enabled, handleClickViewLogs]
    );

    const headerActions = React.useMemo(
        () =>
            isEdgeDeletable && capabilities.toolbar.edgeDrawerDelete.enabled ? (
                <AttributeDrawer.DeleteButton
                    title="Delete edge"
                    ariaLabel="Delete edge"
                    onClick={handleDeleteDrawerEdge}
                />
            ) : null,
        [capabilities.toolbar.edgeDrawerDelete.enabled, handleDeleteDrawerEdge, isEdgeDeletable]
    );

    return (
        <>
            <DiagramDrawer.Root
                anchor="right"
                drawerWidth={drawerWidth}
                joyrideClassName="joyride-edge-attr-drawer"
                openDrawer={!!drawerState?.edge_info}
                zIndex={DEFAULT_ZINDEX_DIAGRAM_DRAWER}
            >
                <DiagramDrawer.Header
                    title={draftEdgeLoaded ? draftEdgeLabel || "Edge" : "Loading Edge..."}
                    subtitle="Edge Attribute Editor"
                    anchor="right"
                    actions={headerActions}
                    hideCloseDrawerButton
                    menuOptions={menuOptions}
                    handleCloseDrawer={handleVerifyCloseEdgeDrawer}
                />
                <DiagramDrawer.Body
                    loaded={draftEdgeLoaded}
                    contentSx={{ overflowY: "hidden" }}
                >
                    <EdgeDrawerBody onCancel={handleCloseEdgeDrawer} />
                </DiagramDrawer.Body>
            </DiagramDrawer.Root>
        </>
    );
};

export default React.memo(EdgeDrawerContentComponent);
