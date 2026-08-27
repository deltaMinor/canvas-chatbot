import { CanvasEdgeColor } from "#root/constants/diagram";
import { DiagramComponentType } from "#root/enums/diagram";

export const getBackgroundColor = ({ type }: { type: string }) => {
    switch (type) {
        case DiagramComponentType.architecture.toString():
            return CanvasEdgeColor.architecture;
        default:
            return "#000";
    }
};
