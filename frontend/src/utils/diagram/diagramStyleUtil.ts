import { CanvasEdgeColor } from "#root/constants/diagram";
import { DiagramComponentType } from "#root/enums/diagram";

export const getBackgroundColor = ({ type }: { type: string }) => {
    switch (type) {
        case DiagramComponentType.architecture.toString():
            return CanvasEdgeColor.architecture;
        case DiagramComponentType.data_flow.toString():
            return CanvasEdgeColor.data_flow;
        case DiagramComponentType.custom.toString():
            return CanvasEdgeColor.threat_scenario;
        default:
            return "#000";
    }
};
