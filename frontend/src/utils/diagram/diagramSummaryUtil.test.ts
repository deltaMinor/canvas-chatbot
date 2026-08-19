import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CanvasType } from "#root/enums/diagram";

// Mock the constructor the SUT instantiates
const mockGetValues = vi.fn();
vi.mock("#root/lib/SummaryCanvasConstructor", () => ({
    SummaryCanvasConstructor: class MockSummaryCanvasConstructor {
        constructor() {}
        getValues() {
            return mockGetValues();
        }
    },
}));

// --- Mocks (only what the SUT actually touches) -----------------------------

// Keep the real enum but stub out heavy types to avoid TS churn in tests
vi.mock("#root/interfaces/diagram", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#root/interfaces/diagram")>();
    return {
        ...actual,
        DiagramNode: {} as any,
        DiagramEdge: {} as any,
        DiagramCanvas: {} as any,
        ProjectDiagram: {} as any,
    };
});

// Provide a stable template we can assert against
const template = {
    canvas_id: "summary-template",
    canvas_name: "Summary",
    canvas_type: "summary",
    nodes: [] as any[],
    edges: [] as any[],
    ref: {} as Record<string, unknown>,
    view_only: false,
};
vi.mock("#root/constants/diagram", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#root/constants/diagram")>();
    return {
        ...actual,
        summary_canvas_template: template,
    };
});

// --- Import SUT after mocks --------------------------------------------------
const { getSummaryCanvas } = await import("./diagramSummaryUtil");
const { summary_canvas_template } = await import("#root/constants/diagram");

// --- Helpers ----------------------------------------------------------------
let id = 0;
const uid = (p = "c_") => `${p}${(id++).toString(36).padStart(4, "0")}`;

const makeCanvas = (over: Partial<any> = {}) => ({
    canvas_id: over.canvas_id ?? uid("c_"),
    canvas_name: over.canvas_name ?? "Canvas",
    canvas_type: over.canvas_type ?? CanvasType.architecture,
    nodes: over.nodes ?? [],
    edges: over.edges ?? [],
    ref: over.ref ?? {},
    view_only: over.view_only ?? false,
});

const makeDiagram = (canvases: any[] = [], extra: Partial<ProjectDiagram> = {}) =>
    ({
        canvas: canvases,
        isCompleted: (extra as any).isCompleted ?? false,
    }) as unknown as ProjectDiagram;

afterEach(() => {
    vi.clearAllMocks();
    id = 0;
});

// --- Tests ------------------------------------------------------------------
describe("getSummaryCanvas", () => {
    beforeEach(() => {
        mockGetValues.mockReturnValue({
            summaryNodes: [],
            summaryEdges: [],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });
    });

    it("builds a summary canvas from constructor values and preserves references", async () => {
        const summaryNodes = [{ id: "n1" }];
        const summaryEdges = [{ id: "e1", source: "n1", target: "n1" }];
        const nodeColumnMapping = { n1: 0 };
        const positionOffset = { x: 10, y: 20 };

        mockGetValues.mockReturnValue({
            summaryNodes,
            summaryEdges,
            nodeColumnMapping,
            positionOffset,
        });

        const pd = makeDiagram([makeCanvas()]);
        const out = getSummaryCanvas({ projectDiagram: pd });

        // Canvas type from template
        expect(out.summary_canvas.canvas_type).toBe(CanvasType.summary);

        // Returned arrays are exactly what constructor returned (no cloning)
        expect(out.summary_canvas.nodes).toBe(summaryNodes);
        expect(out.summary_canvas.edges).toBe(summaryEdges);

        // Extra values are surfaced
        expect(out.nodeColumnMapping).toEqual(nodeColumnMapping);
        expect(out.positionOffset).toEqual(positionOffset);
    });

    it("does not mutate the summary_canvas_template object", () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "n2" }],
            summaryEdges: [{ id: "e2", source: "n2", target: "n2" }],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        // Pre-assert: template is empty
        expect(summary_canvas_template.nodes).toHaveLength(0);
        expect(summary_canvas_template.edges).toHaveLength(0);

        getSummaryCanvas({ projectDiagram: makeDiagram() });

        // Post: still empty (no mutation)
        expect(summary_canvas_template.nodes).toHaveLength(0);
        expect(summary_canvas_template.edges).toHaveLength(0);
    });

    it("ignores an existing summary canvas in the PD and uses the template", () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "n3" }],
            summaryEdges: [{ id: "e3", source: "n3", target: "n3" }],
            nodeColumnMapping: {},
            positionOffset: { x: 5, y: 5 },
        });

        const existingSummary = makeCanvas({
            canvas_id: "existing-summary",
            canvas_type: CanvasType.summary,
            nodes: [{ id: "old" }],
        });

        const pd = makeDiagram([makeCanvas(), existingSummary]);
        const out = getSummaryCanvas({ projectDiagram: pd });

        // It spreads the *template*, not an existing PD canvas
        expect(out.summary_canvas.canvas_id).toBe("summary-template");
        expect(out.summary_canvas.nodes).toEqual([{ id: "n3" }]);
    });

    it("handles empty constructor output gracefully", () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [],
            summaryEdges: [],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        const out = getSummaryCanvas({ projectDiagram: makeDiagram() });

        expect(out.summary_canvas.canvas_type).toBe(CanvasType.summary);
        expect(out.summary_canvas.nodes).toEqual([]);
        expect(out.summary_canvas.edges).toEqual([]);
        expect(out.nodeColumnMapping).toEqual({});
        expect(out.positionOffset).toEqual({ x: 0, y: 0 });
    });
});
