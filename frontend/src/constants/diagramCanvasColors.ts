import { Node } from "@xyflow/react";

import { CanvasNodeVariantType } from "#root/interfaces/diagram";

export const nodeStrokeColor = (_node: Node) => {
    return "#fff";
};

// methods for the minimap to display nodes grouped together by their colors
export const nodeColor = (node: Node) => {
    let color = "#d2d2d2";
    if (node?.type === CanvasNodeVariantType.clusterNode) {
        if (node?.parentId) return "#8438FF";
        return color;
    }
    switch (node?.data?.["type"]) {
        case "terraform":
            color = "#FF38B3";
            break;
        case "data_flow":
            color = "#FFE838";
            break;
        case "custom":
            color = "#38FF84";
            break;
    }
    return color;
};
