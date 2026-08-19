import React from "react";
import { useDispatch, useStore } from "react-redux";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import {
    useDiagramDraftCanvas,
    useDiagramDraftCanvasId,
    useDiagramDraftCanvasLLMGenerationStatus,
    useDiagramDraftCanvasViewOnly,
    useDiagramSelectedPathId,
    useHideAllPaths,
    useInitDraftCanvasId,
    useViewAllPaths,
} from "#root/hooks/diagram";
import { DiagramViewInstanceResolver } from "#root/lib/DiagramViewInstanceResolver";
import { RootState } from "#root/redux/store";

export const useDiagramViewSyncEffect = () => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const instanceId = useDiagramInstanceId();
    const initDraftCanvasId = useInitDraftCanvasId();
    const draftCanvas = useDiagramDraftCanvas();
    const draftCanvasId = useDiagramDraftCanvasId();
    const selectedCanvasLlmGenerationStatus = useDiagramDraftCanvasLLMGenerationStatus();
    const selectedCanvasViewOnly = useDiagramDraftCanvasViewOnly();
    const selectedPathId = useDiagramSelectedPathId();
    const viewAllPaths = useViewAllPaths();
    const hideAllPaths = useHideAllPaths();
    const projectDiagram = useProjectDiagram();

    const viewStateSignature = React.useMemo(
        () =>
            JSON.stringify({
                draftCanvasId,
                draftCanvasNodeCount: draftCanvas?.nodes?.length ?? 0,
                draftCanvasSourceId: draftCanvas?.canvas_id,
                draftCanvasSourceType: draftCanvas?.canvas_type,
                selectedPathId,
                viewAllPaths,
                hideAllPaths,
                selectedCanvasViewOnly: !!selectedCanvasViewOnly,
                selectedCanvasLlmGenerationStatus,
            }),
        [
            draftCanvasId,
            draftCanvas?.canvas_id,
            draftCanvas?.canvas_type,
            draftCanvas?.nodes?.length,
            hideAllPaths,
            selectedCanvasLlmGenerationStatus,
            selectedCanvasViewOnly,
            selectedPathId,
            viewAllPaths,
        ]
    );

    const backendDiagramSignature = React.useMemo(
        () =>
            JSON.stringify({
                canvasCount: projectDiagram?.canvas?.length ?? 0,
                modifiedOn: projectDiagram?.metadata?.modified_on?.timestamp ?? "",
                isAuthorizedUpdate: true,
            }),
        [projectDiagram?.canvas?.length, projectDiagram?.metadata?.modified_on?.timestamp]
    );

    React.useEffect(() => {
        if (!draftCanvasId) {
            initDraftCanvasId();
            return;
        }

        new DiagramViewInstanceResolver({
            instanceId,
            listenerApi: {
                dispatch,
                getState: () => store.getState(),
            },
        }).syncView();
    }, [
        backendDiagramSignature,
        dispatch,
        draftCanvasId,
        draftCanvas?.canvas_id,
        draftCanvas?.canvas_type,
        draftCanvas?.nodes?.length,
        hideAllPaths,
        initDraftCanvasId,
        instanceId,
        projectDiagram?.canvas?.length,
        selectedCanvasLlmGenerationStatus,
        selectedCanvasViewOnly,
        selectedPathId,
        store,
        viewAllPaths,
        viewStateSignature,
    ]);
};
