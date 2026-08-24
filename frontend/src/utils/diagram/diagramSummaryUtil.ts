import { summary_canvas_template } from "#root/constants/diagram";
import { ProjectDiagram } from "#root/interfaces/diagram";
import { SummaryCanvasConstructor } from "#root/lib/SummaryCanvasConstructor";

////////////////////////////////////////////////////////////////////////////////
// Construct summary canvas
////////////////////////////////////////////////////////////////////////////////

export const getSummaryCanvas = ({ projectDiagram }: { projectDiagram: ProjectDiagram }) => {
    const canvasConstructor = new SummaryCanvasConstructor({
        projectDiagram, //
    });
    const {
        summaryNodes, //
        summaryEdges,
        nodeColumnMapping,
        positionOffset,
    } = canvasConstructor.getValues();

    return {
        summary_canvas: {
            ...summary_canvas_template,
            nodes: summaryNodes,
            edges: summaryEdges,
        },
        nodeColumnMapping,
        positionOffset,
    };
};
