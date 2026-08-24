import { CanvasType } from "#root/enums/diagram";
import { DiagramCanvas } from "#root/interfaces/diagram";
import { DiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";

interface GetDraftCanvasDrawerStateInput {
    currentDrawerState: DiagramInstanceState["drawerState"];
    draftCanvas?: DiagramCanvas | undefined;
}

export const getDraftCanvasDrawerState = ({
    currentDrawerState,
    draftCanvas,
}: GetDraftCanvasDrawerStateInput): DiagramInstanceState["drawerState"] | undefined => {
    if (!draftCanvas) {
        return undefined;
    }

    if (draftCanvas.canvas_type === CanvasType.architecture) {
        return {
            ...currentDrawerState,
            diagram_user_story: false,
            diagram_resource: !draftCanvas.view_only,
        };
    }

    return undefined;
};
