import { CanvasType, DiagramCanvas, DiagramNode } from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { generateUUID } from "#root/utils/identifierUtil";

const VALID_CANVAS_TYPES = new Set<string>(Object.values(CanvasType));

const reviveNodeExtent = (extent: unknown): DiagramNode["extent"] => {
    return extent === "parent" ? "parent" : undefined;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const withDefaultCanvasMetadata = (canvas: Record<string, unknown>): DiagramCanvas => {
    const canvasType = canvas["canvas_type"] as CanvasType;

    return {
        ...canvas,
        canvas_id:
            typeof canvas["canvas_id"] === "string" && canvas["canvas_id"]
                ? canvas["canvas_id"]
                : generateUUID(UuidIdentifierKey.diagramCanvas),
        canvas_name:
            typeof canvas["canvas_name"] === "string" && canvas["canvas_name"]
                ? canvas["canvas_name"]
                : canvasType.charAt(0).toUpperCase() + canvasType.slice(1),
        canvas_type: canvasType,
        llm_generation_status:
            typeof canvas["llm_generation_status"] === "number"
                ? canvas["llm_generation_status"]
                : 0,
        ref: isPlainObject(canvas["ref"]) ? canvas["ref"] : {},
        view_only: typeof canvas["view_only"] === "boolean" ? canvas["view_only"] : false,
        warnings: Array.isArray(canvas["warnings"]) ? canvas["warnings"] : [],
    } as DiagramCanvas;
};

export const parseImportedDiagramCanvas = (rawText: string): DiagramCanvas[] => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new Error("The attached file is not valid JSON.");
    }

    if (!isPlainObject(parsed) || !Array.isArray(parsed["canvas"])) {
        throw new Error(
            "The attached file does not contain a valid diagram. Expected an exported project diagram JSON with a 'canvas' array."
        );
    }

    const canvasList = parsed["canvas"];
    if (!canvasList.length) {
        throw new Error("The attached diagram does not contain any canvases.");
    }

    return canvasList.map((canvas: unknown, index: number) => {
        if (!isPlainObject(canvas)) {
            throw new Error(`Canvas at index ${index} is not a valid diagram canvas.`);
        }
        const canvasType = canvas["canvas_type"];
        if (typeof canvasType !== "string" || !VALID_CANVAS_TYPES.has(canvasType)) {
            throw new Error(`Canvas at index ${index} has an invalid 'canvas_type'.`);
        }
        if (!Array.isArray(canvas["nodes"]) || !Array.isArray(canvas["edges"])) {
            throw new Error(
                `Canvas of type "${canvasType}" at index ${index} is missing a valid 'nodes' or 'edges' array.`
            );
        }

        const normalizedCanvas = withDefaultCanvasMetadata(canvas);
        normalizedCanvas.nodes = normalizedCanvas.nodes.map((node) =>
            isPlainObject(node)
                ? ({ ...node, extent: reviveNodeExtent(node["extent"]) } as DiagramNode)
                : node
        );
        return normalizedCanvas;
    });
};
