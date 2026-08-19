import React from "react";

import { closeSnackbar, enqueueSnackbar } from "notistack";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useDiagramDraftCanvas, useDiagramView } from "#root/hooks/diagram";
import { useIsProjectCqCompleted } from "#root/hooks/diagram/useIsProjectCqCompleted";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

export const useDiagramLockedCanvasNoticeEffect = () => {
    const instanceId = useDiagramInstanceId();
    const selectedCanvas = useDiagramDraftCanvas();
    const diagramView = useDiagramView();
    const isCqCompleted = useIsProjectCqCompleted();
    const isAuthorized = true;
    const effectiveCanvasType = selectedCanvas?.canvas_type || "";
    const effectiveViewOnly = !!selectedCanvas?.view_only || !isCqCompleted || !isAuthorized;

    // One fixed key per diagram instance — switching between locked canvases
    // reuses the same key so preventDuplicate suppresses a second snackbar.
    const noticeKey = `${instanceId}:canvas-locked`;

    // Track whether the CQ-locked dialog has been shown for the current lock
    // occurrence so it only appears once per canvas load, not on every re-render.
    const cqDialogShownRef = React.useRef(false);

    React.useEffect(() => {
        if (isCqCompleted) {
            cqDialogShownRef.current = false;
        }
    }, [isCqCompleted]);

    React.useEffect(() => {
        if (
            !!selectedCanvas &&
            effectiveViewOnly &&
            !!effectiveCanvasType &&
            diagramView !== "visualizer"
        ) {
            const message = !isAuthorized
                ? "You are not authorized to edit this diagram."
                : !isCqCompleted
                  ? "Submit the Conception Questionnaire to unlock diagram editing."
                  : "The diagram has been submitted and is locked.";

            enqueueSnackbar(message, {
                key: noticeKey,
                preventDuplicate: true,
                variant: "info",
            });

            if (!isCqCompleted && !cqDialogShownRef.current) {
                cqDialogShownRef.current = true;
                handleOpenDialog(DialogStateEnum.diagramLockedCQ);
            }

            return;
        }

        closeSnackbar(noticeKey);
    }, [
        diagramView,
        effectiveCanvasType,
        effectiveViewOnly,
        instanceId,
        isAuthorized,
        isCqCompleted,
        noticeKey,
        selectedCanvas,
    ]);
};

export default useDiagramLockedCanvasNoticeEffect;
