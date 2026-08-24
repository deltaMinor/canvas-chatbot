import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import { CanvasType } from "#root/interfaces/diagram";
import { DiagramView } from "#root/interfaces/redux";
import { getDraftCanvasIdFromStore } from "#root/stores/projectDiagram/backend";
import { setDiagramDraftCanvasId } from "#root/stores/projectDiagram/canvas";
import { getDiagramViewFromStore } from "#root/stores/projectDiagram/joyride";

const getTargetCanvasType = (diagramView: DiagramView) => {
    if (diagramView === "editor") {
        return CanvasType.architecture;
    }

    return null;
};

const getCanvasMatchesDiagramView = ({
    canvasType,
    diagramView,
}: {
    canvasType: CanvasType | undefined;
    diagramView: DiagramView;
}) => {
    if (diagramView === "editor") {
        return canvasType === CanvasType.architecture;
    }

    return false;
};

export const useDiagramViewDraftCanvasEffect = () => {
    const instanceId = useDiagramInstanceId();
    const projectDiagram = useProjectDiagram();
    const lastSyncedDiagramViewRef = React.useRef<DiagramView>(null);

    const canvasSignature = React.useMemo(
        () =>
            (projectDiagram?.canvas ?? [])
                .map((canvas) => `${canvas.canvas_id}:${canvas.canvas_type}`)
                .join("|"),
        [projectDiagram?.canvas]
    );

    React.useEffect(() => {
        const canvas = projectDiagram?.canvas ?? [];
        const diagramView = getDiagramViewFromStore(instanceId);
        const targetCanvasType = getTargetCanvasType(diagramView);

        if (!canvas.length || !targetCanvasType) return;

        const draftCanvasId = getDraftCanvasIdFromStore(instanceId);
        const draftCanvas = canvas.find((item) => item.canvas_id === draftCanvasId);
        const currentCanvasMatchesView = getCanvasMatchesDiagramView({
            canvasType: draftCanvas?.canvas_type, //
            diagramView,
        });
        if (currentCanvasMatchesView) {
            lastSyncedDiagramViewRef.current = diagramView;
            return;
        }

        const nextCanvas = canvas.find((item) => item.canvas_type === targetCanvasType);
        if (!nextCanvas) return;

        lastSyncedDiagramViewRef.current = diagramView;

        if (draftCanvasId === nextCanvas.canvas_id) return;

        setDiagramDraftCanvasId(nextCanvas.canvas_id, instanceId);
    }, [canvasSignature, instanceId, projectDiagram?.canvas]);
};

export default useDiagramViewDraftCanvasEffect;
