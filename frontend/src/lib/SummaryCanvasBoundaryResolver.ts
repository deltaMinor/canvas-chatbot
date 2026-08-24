import { CanvasType } from "#root/enums/diagram";
import { DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import { getNodePositionAbsolute } from "#root/utils/diagram/diagramNodePositionUtil";

export class SummaryCanvasBoundaryResolver {
    projectDiagram: ProjectDiagram;
    allNodes: DiagramNode[];
    architectureNodes: DiagramNode[];

    constructor({
        projectDiagram, //
    }: {
        projectDiagram: ProjectDiagram;
    }) {
        this.projectDiagram = projectDiagram;
        this.allNodes = projectDiagram.canvas.flatMap((c) => c.nodes) || [];
        this.architectureNodes =
            projectDiagram.canvas?.find(
                (c) => c?.canvas_type === CanvasType.architecture.toString()
            )?.nodes ?? [];
    }

    getOutermostPositionOfArchitectureNodes() {
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        if (this.architectureNodes.length === 0) {
            return { minX, minY, maxX, maxY };
        }

        for (const node of this.architectureNodes) {
            // Skip node if it is a child node
            if (!!node?.parentId) continue;

            const nodePositionAbsolute = getNodePositionAbsolute({
                node, //
                allNodes: this.allNodes,
            });
            minX = Math.min(minX, nodePositionAbsolute.x);
            minY = Math.min(minY, nodePositionAbsolute.y);
            maxX = Math.max(
                maxX,
                nodePositionAbsolute.x + Number(node?.width ?? node?.style?.width ?? 0)
            );
            maxY = Math.max(
                maxY,
                nodePositionAbsolute.y + Number(node?.height ?? node?.style?.height ?? 0)
            );
        }
        return { minX, minY, maxX, maxY };
    }

    getExtremePositions() {
        const {
            minY: extremeTopY, //
            maxY: extremeBottomY,
            minX: extremeLeftX,
            maxX: extremeRightX,
        } = this.getOutermostPositionOfArchitectureNodes();
        const extremePositions = [
            {
                x: extremeLeftX, //
                y: extremeTopY,
                positionKey: "top_left",
            },
            {
                x: extremeRightX, //
                y: extremeTopY,
                positionKey: "top_right",
            },
            {
                x: extremeLeftX, //
                y: extremeBottomY,
                positionKey: "bottom_left",
            },
            {
                x: extremeRightX,
                y: extremeBottomY,
                positionKey: "bottom_right",
            },
        ];
        return {
            extremePositions,
            extremeTopY,
            extremeBottomY,
            extremeLeftX,
            extremeRightX,
        };
    }
}
