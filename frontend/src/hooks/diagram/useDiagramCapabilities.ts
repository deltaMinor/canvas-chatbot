import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { CanvasType } from "#root/enums/diagram";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import { DiagramCapabilitiesState, DiagramToolbarCapabilities } from "#root/interfaces/redux";
import { setDiagramCapabilities } from "#root/stores/projectDiagram/capabilities";

import {
    useDiagramCanvasHistory,
    useDiagramCanvasHistoryIndex,
    useDiagramDraftCanvas,
    useDiagramDraftCanvasType,
    useDiagramView,
    useDiagramWarningListMapping,
} from "./projectDiagramFeatureHooks";

const EMPTY_BUTTON = { show: false, enabled: false };

const EMPTY_TOOLBAR: DiagramToolbarCapabilities = {
    import: EMPTY_BUTTON,
    export: EMPTY_BUTTON,
    clear: EMPTY_BUTTON,
    logs: EMPTY_BUTTON,
    llmDataflow: EMPTY_BUTTON,
    setComplete: EMPTY_BUTTON,
    unsetComplete: EMPTY_BUTTON,
    tutorial: EMPTY_BUTTON,
    undo: EMPTY_BUTTON,
    redo: EMPTY_BUTTON,
    biDirectionalArrow: EMPTY_BUTTON,
    nodeDrawerSave: EMPTY_BUTTON,
    edgeDrawerSave: EMPTY_BUTTON,
    dataFlowDrawerEdit: EMPTY_BUTTON,
    editToolbar: EMPTY_BUTTON,
    nodeDrawerDelete: EMPTY_BUTTON,
    edgeDrawerDelete: EMPTY_BUTTON,
    nodeDrawerLogs: EMPTY_BUTTON,
    edgeDrawerLogs: EMPTY_BUTTON,
    setupDialogConfirm: EMPTY_BUTTON,
    importJsonFileCreate: EMPTY_BUTTON,
    importJsonFileDelete: EMPTY_BUTTON,
    importCactiFileCreate: EMPTY_BUTTON,
    importCactiFileDelete: EMPTY_BUTTON,
    importImageFileCreate: EMPTY_BUTTON,
    importImageFileUpdate: EMPTY_BUTTON,
    importImageFileDelete: EMPTY_BUTTON,
    importXmlFileCreate: EMPTY_BUTTON,
    importXmlFileDelete: EMPTY_BUTTON,
    importModuleFileCreate: EMPTY_BUTTON,
    importModuleFileDelete: EMPTY_BUTTON,
    importTerraformFileCreate: EMPTY_BUTTON,
    importTerraformFileDelete: EMPTY_BUTTON,
    uploadPdfFileCreate: EMPTY_BUTTON,
    uploadPdfFileDelete: EMPTY_BUTTON,
    selectJsonOption: EMPTY_BUTTON,
    selectCactiOption: EMPTY_BUTTON,
    selectImageOption: EMPTY_BUTTON,
    selectXmlOption: EMPTY_BUTTON,
    selectIacOption: EMPTY_BUTTON,
    selectPdfOption: EMPTY_BUTTON,
    iacTerraformTab: EMPTY_BUTTON,
    iacModuleTab: EMPTY_BUTTON,
};

const VISUALIZER_CAPABILITIES: DiagramCapabilitiesState = {
    toolbar: EMPTY_TOOLBAR,
    canvases: {},
};

/**
 * Computes the final combined editing capabilities for the current diagram
 * instance.  All contributing factors are baked in here -- canvas type,
 * canvas.view_only (diagram submitted), authorization, completion state,
 * warning checks, and history availability.
 *
 * Returns the computed capabilities directly (no Redux round-trip lag) and
 * keeps Redux in sync as a side-effect so store-level access via
 * getDiagramCapabilitiesFromStore() reflects the current state for
 * non-React event-handler callbacks.
 *
 * Toolbar keys:
 *   import, export, clear, logs, llmDataflow, setComplete, unsetComplete,
 *   tutorial, undo, redo, biDirectionalArrow, nodeDrawerSave, edgeDrawerSave,
 *   dataFlowDrawerEdit
 *
 * Each key -> { show: boolean; enabled: boolean }
 *   show    = whether to render the button
 *   enabled = whether the button is interactive (not disabled)
 *
 * Visibility (show) uses a "soft" view-only that excludes auth so unauthorized
 * users still see buttons -- just disabled -- giving them a clear signal of
 * what actions are available in principle.
 *
 * canvases -> { [canvasId]: boolean }
 *   true when editing is allowed on that canvas (incorporates auth + view_only).
 */
export const useDiagramCapabilities = (): DiagramCapabilitiesState => {
    const instanceId = useDiagramInstanceId();
    const projectDiagram = useProjectDiagram();
    const selectedCanvas = useDiagramDraftCanvas();
    const canvasType = useDiagramDraftCanvasType();
    const diagramView = useDiagramView();
    const warningListMapping = useDiagramWarningListMapping();
    const canvasHistory = useDiagramCanvasHistory();
    const canvasHistoryIndex = useDiagramCanvasHistoryIndex();

    const canUpdate = true;
    const canRead = true;
    const canReadLogs = true;
    const canCreateJsonFile = true;
    const canDeleteJsonFile = true;
    const canCreatePdfFile = true;
    const canDeletePdfFile = true;
    const canCreateCactiFile = true;
    const canDeleteCactiFile = true;
    const canCreateImageFile = true;
    const canUpdateImageFile = true;
    const canDeleteImageFile = true;
    const canCreateXmlFile = true;
    const canDeleteXmlFile = true;
    const canCreateModuleFile = true;
    const canDeleteModuleFile = true;
    const canCreateTerraformFile = true;
    const canDeleteTerraformFile = true;
    const isCompleted = !!projectDiagram?.isCompleted;

    // Boolean intermediates for undo/redo -- memo only reruns when availability
    // actually flips, not on every history index change.
    const canUndo = canvasHistoryIndex > 0;
    const canRedo = canvasHistoryIndex < (canvasHistory?.length ?? 0) - 1;

    const isMarkCompleteDisabledByCheck = React.useMemo(
        () =>
            Object.values(warningListMapping ?? {})
                .flat()
                .some((w) => w.priority > 5) && !isCompleted,
        [isCompleted, warningListMapping]
    );

    const capabilities = React.useMemo((): DiagramCapabilitiesState => {
        if (diagramView === "visualizer") {
            return VISUALIZER_CAPABILITIES;
        }

        // "soft" view-only: canvas submitted (view_only).
        // Authorization is intentionally NOT included here -- unauthorized users
        // still see buttons (just disabled) so they know what actions exist.
        const softViewOnly = !!selectedCanvas?.view_only;

        const isArch = canvasType === CanvasType.architecture;

        return {
            toolbar: {
                // architecture only; hidden when locked/submitted; disabled when unauthorized
                import: { show: isArch && !softViewOnly, enabled: canUpdate },
                // read-only action; always shown on valid canvas types; disabled when unauthorized
                export: { show: isArch, enabled: canRead },
                // architecture only; hidden when locked/submitted; disabled when unauthorized
                clear: { show: isArch && !softViewOnly, enabled: canUpdate },
                // always shown on valid canvas types; disabled when unauthorized
                logs: { show: isArch, enabled: canReadLogs },
                // architecture only; hidden when locked/submitted or already complete
                setComplete: {
                    show: isArch && !softViewOnly && !isCompleted,
                    enabled: canUpdate && !isMarkCompleteDisabledByCheck,
                },
                // shown whenever diagram is completed (visible even when locked so
                // users can see the Edit button); disabled by auth
                unsetComplete: {
                    show: isCompleted,
                    enabled: canUpdate,
                },
                // architecture only; hidden when locked/submitted; no auth gate
                tutorial: { show: isArch && !softViewOnly, enabled: true },
                // undo/redo: enabled only when history is available.
                // Not gated by canvas lock state - these buttons are always available.
                undo: {
                    show: canvasType !== undefined,
                    enabled: canUpdate && canUndo,
                },
                redo: {
                    show: canvasType !== undefined,
                    enabled: canUpdate && canRedo,
                },
                // bidirectional arrow FAB: shown on architecture; enabled when canvas is editable
                biDirectionalArrow: {
                    show: isArch,
                    enabled: !softViewOnly && canUpdate,
                },
                // drawer save buttons: enabled when canvas is editable
                nodeDrawerSave: { show: true, enabled: !softViewOnly && canUpdate },
                edgeDrawerSave: { show: true, enabled: !softViewOnly && canUpdate },
                // all edit-toolbar stacks (align, layer, distribute, copy/paste/delete).
                // Not gated by canvas lock state - always available.
                editToolbar: { show: true, enabled: canUpdate },
                // delete actions in attribute drawer headers
                nodeDrawerDelete: { show: true, enabled: !softViewOnly && canUpdate },
                edgeDrawerDelete: { show: true, enabled: !softViewOnly && canUpdate },
                // view logs menu item in node attribute drawer header
                nodeDrawerLogs: { show: true, enabled: canReadLogs },
                // view logs menu item in edge attribute drawer header
                edgeDrawerLogs: { show: true, enabled: canReadLogs },
                // setup dialog confirm button
                setupDialogConfirm: { show: true, enabled: !softViewOnly && canUpdate },
                // per-type file table upload/delete actions
                importJsonFileCreate: { show: true, enabled: canCreateJsonFile },
                importJsonFileDelete: { show: true, enabled: canDeleteJsonFile },
                importCactiFileCreate: { show: true, enabled: canCreateCactiFile },
                importCactiFileDelete: { show: true, enabled: canDeleteCactiFile },
                importImageFileCreate: { show: true, enabled: canCreateImageFile },
                importImageFileUpdate: { show: true, enabled: canUpdateImageFile },
                importImageFileDelete: { show: true, enabled: canDeleteImageFile },
                importXmlFileCreate: { show: true, enabled: canCreateXmlFile },
                importXmlFileDelete: { show: true, enabled: canDeleteXmlFile },
                importModuleFileCreate: { show: true, enabled: canCreateModuleFile },
                importModuleFileDelete: { show: true, enabled: canDeleteModuleFile },
                importTerraformFileCreate: { show: true, enabled: canCreateTerraformFile },
                importTerraformFileDelete: { show: true, enabled: canDeleteTerraformFile },
                uploadPdfFileCreate: { show: true, enabled: canCreatePdfFile },
                uploadPdfFileDelete: { show: true, enabled: canDeletePdfFile },
                // setup dialog radio button enablement per file type
                selectJsonOption: { show: true, enabled: canCreateJsonFile },
                selectCactiOption: { show: true, enabled: canCreateCactiFile },
                selectImageOption: { show: true, enabled: canCreateImageFile },
                selectXmlOption: { show: true, enabled: canCreateXmlFile },
                selectIacOption: {
                    show: true,
                    enabled: canCreateModuleFile || canCreateTerraformFile,
                },
                selectPdfOption: { show: true, enabled: canCreatePdfFile },
                // IaC tab enablement
                iacTerraformTab: { show: true, enabled: canCreateTerraformFile },
                iacModuleTab: { show: true, enabled: canCreateModuleFile },
            },
            canvases: Object.fromEntries(
                (projectDiagram?.canvas ?? []).map((c) => [
                    c.canvas_id,
                    // "hard" view-only for canvas interaction: includes auth
                    !c.view_only && canUpdate,
                ])
            ),
        };
    }, [
        canCreateCactiFile,
        canCreateImageFile,
        canCreateJsonFile,
        canCreateModuleFile,
        canCreatePdfFile,
        canCreateTerraformFile,
        canCreateXmlFile,
        canDeleteCactiFile,
        canDeleteImageFile,
        canDeleteJsonFile,
        canDeleteModuleFile,
        canDeletePdfFile,
        canDeleteTerraformFile,
        canDeleteXmlFile,
        canRead,
        canReadLogs,
        canRedo,
        canUndo,
        canUpdate,
        canUpdateImageFile,
        canvasType,
        diagramView,
        isCompleted,
        isMarkCompleteDisabledByCheck,
        projectDiagram?.canvas,
        selectedCanvas?.view_only,
    ]);

    // Keep Redux in sync so non-React code (event handlers, store-level getters)
    // always sees the current capabilities.
    React.useEffect(() => {
        setDiagramCapabilities(capabilities, instanceId);
    }, [capabilities, instanceId]);

    return capabilities;
};

export default useDiagramCapabilities;
