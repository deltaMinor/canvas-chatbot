import { architectureEdgeHandleMapping } from "#root/constants/diagram";
import {
    CanvasType,
    DiagramEdge,
    DiagramNode,
    ProjectDiagram,
    SummaryCanvasColumn,
    SummaryCanvasColumnPositionAttr,
} from "#root/interfaces/diagram";

import { SummaryEdgeConstructor } from "./SummaryEdgeConstructor";
import { SummaryNodeConstructor } from "./SummaryNodeConstructor";

export class SummaryCanvasConstructor {
    projectDiagram: ProjectDiagram;
    //
    summaryNodes: DiagramNode[];
    summaryEdges: DiagramEdge[];
    nodeColumnMapping: {
        [x: string]: SummaryCanvasColumn;
    };
    positionOffset:
        | {
              [key in SummaryCanvasColumn]: SummaryCanvasColumnPositionAttr;
          }
        | null;
    diagramEdges__dataFlow: DiagramEdge[];

    constructor({
        projectDiagram, //
    }: {
        projectDiagram: ProjectDiagram;
    }) {
        this.projectDiagram = projectDiagram;
        //
        this.summaryNodes = [];
        this.summaryEdges = [];
        this.nodeColumnMapping = {};
        this.positionOffset = null;
        this.diagramEdges__dataFlow = projectDiagram.canvas
            .filter((c) => {
                return c?.canvas_type === CanvasType.data_flow.toString();
            })
            .flatMap((c) => c?.edges);
    }

    updateEdges() {
        const edgeConstructor = new SummaryEdgeConstructor({
            projectDiagram: this.projectDiagram, //
            summaryNodes: this.summaryNodes,
            nodeColumnMapping: this.nodeColumnMapping,
        });
        const {
            edges: summaryEdges, //
        } = edgeConstructor.getUniqueEdges({
            edges: this.diagramEdges__dataFlow,
            edgeHandleMapping: architectureEdgeHandleMapping,
        });
        this.summaryEdges = summaryEdges;
    }

    updateNodes() {
        const nodeConstructor = new SummaryNodeConstructor({
            projectDiagram: this.projectDiagram,
        });
        const {
            nodes: summaryNodes, //
            nodeColumnMapping,
            positionOffset,
        } = nodeConstructor.getUniqueDataFlowNodes();

        this.summaryNodes = summaryNodes;
        this.nodeColumnMapping = nodeColumnMapping;
        this.positionOffset = positionOffset;
    }

    getValues() {
        this.updateNodes();
        this.updateEdges();

        return {
            summaryNodes: this.summaryNodes, //
            summaryEdges: this.summaryEdges,
            nodeColumnMapping: this.nodeColumnMapping,
            positionOffset: this.positionOffset,
        };
    }
}
