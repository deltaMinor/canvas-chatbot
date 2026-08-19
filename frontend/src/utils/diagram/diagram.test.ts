import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CanvasType } from "#root/enums/diagram";

// Hoisted module mocks (must be before SUT import)

const diagramSvc = vi.hoisted(() => ({
    patchProjectDiagram: vi.fn(),
}));
vi.mock("#root/services/domain/diagram", () => diagramSvc);

vi.mock("#root/constants/diagram", () => ({
    HORIZONTAL_PASTE_OFFSET: 10,
    VERTICAL_PASTE_OFFSET: 20,
    default_canvas: [
        { canvas_id: "c0", canvas_type: "architecture", nodes: [], edges: [] },
        { canvas_id: "c1", canvas_type: "data_flow", nodes: [], edges: [] },
    ],
}));

const nodeUtil = vi.hoisted(() => ({
    getInitializedDiagramNodes: vi.fn((nodes: any[]) =>
        nodes.map((n) => ({ ...n, __initedNode: true }))
    ),
    checkIfNodeCanBeDeleted: vi.fn(),
    patchCanvasListWithUpdatedIcons: vi.fn(),
}));
vi.mock("./diagramNodeUtil", () => nodeUtil);

const edgeUtil = vi.hoisted(() => ({
    getInitializedDiagramEdges: vi.fn((edges: any[]) =>
        edges.map((e) => ({ ...e, __initedEdge: true }))
    ),
    checkIfEdgeCanBeDeleted: vi.fn(),
}));
vi.mock("./diagramEdgeUtil", () => edgeUtil);

const posUtil = vi.hoisted(() => ({
    getNodePositionAbsolute: vi.fn(({ node }: any) => node.position),
}));
vi.mock("./diagramNodePositionUtil", () => posUtil);

const canvasUtil = vi.hoisted(() => ({
    getSelectedCanvasFromId: vi.fn(({ projectDiagram, selectedCanvasId }: any) =>
        projectDiagram?.canvas?.find((c: any) => c.canvas_id === selectedCanvasId)
    ),
    updateCanvasViewOnly: vi.fn(),
    updateDFCanvas: vi.fn((pd: any, _arch: any) => ({
        __projectDiagram: pd,
        updateDF: false,
    })),
}));
vi.mock("./diagramCanvasUtil", () => canvasUtil);

vi.mock("uuid", async () => {
    const actual = await vi.importActual<typeof import("uuid")>("uuid");
    return {
        ...actual,
        v4: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
    };
});

// ---------------------
// Import SUTs **after** all mocks
// ---------------------
// prettier-ignore
const {
  getFilteredCanvasNodesOrEdges,
  getInitializedCanvasNodesAndEdges,
  getProcessedProjectDiagram,
  getUpdatedDiagramPostDeleteNodesOps,
  getUpdatedNodesAndEdgesAfterPasteOp,
  processDeleteAllNodesAndEdges,
  processDeleteCanvasNodesAndEdges,
  processProjectDiagram,
  updateXYPositionAfterPasteOp,
} =await import("./diagram");

// ---------------------
// Test helpers & factories
// ---------------------
type WM = any;

const baseArch = {
    canvas_id: "arch",
    canvas_type: CanvasType.architecture,
    canvas_name: "Architecture",
    nodes: [] as any[],
    edges: [] as any[],
    llm_generation_status: 0,
    ref: null as any,
    view_only: false,
} satisfies Partial<DiagramCanvas<WM>>;

const baseDf = {
    canvas_id: "df",
    canvas_type: CanvasType.data_flow,
    canvas_name: "Data Flow",
    nodes: [] as any[],
    edges: [] as any[],
    llm_generation_status: 0,
    ref: null as any,
    view_only: false,
} satisfies Partial<DiagramCanvas<WM>>;

export const archCanvas = (over: Partial<DiagramCanvas<WM>> = {}): DiagramCanvas<WM> =>
    ({ ...baseArch, ...over }) as unknown as DiagramCanvas<WM>;

export const dfCanvas = (over: Partial<DiagramCanvas<WM>> = {}): DiagramCanvas<WM> =>
    ({ ...baseDf, ...over }) as unknown as DiagramCanvas<WM>;

const node = (id: string, extra: any = {}) => ({
    id,
    data: { type: "architecture", ...extra.data },
    position: { x: 0, y: 0, ...(extra.position || {}) },
    ...extra,
});

const edge = (id: string, s: string, t: string, extra: any = {}) => ({
    id,
    source: s,
    target: t,
    data: { type: "architecture", ...(extra.data || {}) },
    ...extra,
});

// ---------------------
// Lifecycle
// ---------------------
beforeEach(() => {
    vi.clearAllMocks();
});
afterEach(() => {
    vi.useRealTimers();
});

// ---------------------
// Tests
// ---------------------
describe("getInitializedCanvasNodesAndEdges", () => {
    it("returns input when canvas is empty object", () => {
        // @ts-expect-error partial ok for unit test
        const result = getInitializedCanvasNodesAndEdges({});
        expect(result).toEqual({});
    });

    it("initializes nodes and edges", () => {
        const result = getInitializedCanvasNodesAndEdges(
            archCanvas({
                nodes: [node("n1")],
                edges: [edge("e1", "n1", "n1")],
            })
        );

        expect((result.nodes[0] as any).__initedNode).toBe(true);
        expect((result.edges[0] as any).__initedEdge).toBe(true);
        expect(nodeUtil.getInitializedDiagramNodes).toHaveBeenCalledTimes(1);
        expect(edgeUtil.getInitializedDiagramEdges).toHaveBeenCalledTimes(1);
    });
});

describe("getProcessedProjectDiagram", () => {
    it("injects default canvas when none present", () => {
        const pd = { id: "p1", canvas: [] as any[] };
        const out = getProcessedProjectDiagram(pd as any, false);
        expect(out.canvas.length).toBeGreaterThan(0);
        const arch = out.canvas.find((c: any) => c.canvas_type === "architecture");
        expect(arch).toBeTruthy();
    });

    it("initializes only architecture canvas", () => {
        const pd = {
            id: "p2",
            canvas: [
                archCanvas({
                    nodes: [node("a1")],
                    edges: [edge("e1", "a1", "a1")],
                }),
                dfCanvas({
                    nodes: [node("d1", { data: { type: "data_flow" } })],
                }),
            ],
        };
        const originalDfNode = pd.canvas[1].nodes[0];

        const out = getProcessedProjectDiagram(pd as any, false);
        const a0 = out.canvas.find((c: any) => c.canvas_type === CanvasType.architecture);
        expect(a0).toBeDefined();
        const d0 = out.canvas.find((c: any) => c.canvas_type === CanvasType.data_flow);
        expect(d0).toBeDefined();

        expect(nodeUtil.getInitializedDiagramNodes).toHaveBeenCalledTimes(1);
        expect(edgeUtil.getInitializedDiagramEdges).toHaveBeenCalledTimes(1);

        expect(a0!.nodes).toHaveLength(1);
        expect(a0!.edges).toHaveLength(1);
        expect(a0!.nodes[0].id).toBe("a1");
        expect(a0!.edges[0].id).toBe("e1");

        // DF nodes untouched (same content)
        expect(d0!.nodes[0]).toStrictEqual(originalDfNode);
    });

    it("injects default_canvas and calls patchCanvasListWithUpdatedIcons(updateDB=true)", () => {
        const pd = { id: "pX", canvas: [] as any[] };
        const out = getProcessedProjectDiagram(pd as any, false);

        // default canvas injected
        expect(out.canvas.length).toBeGreaterThan(0);

        // patchCanvasListWithUpdatedIcons called with updateDB=true
        expect(nodeUtil.patchCanvasListWithUpdatedIcons).toHaveBeenCalledTimes(1);
        const args = (nodeUtil.patchCanvasListWithUpdatedIcons as any).mock.calls[0];
        expect(Array.isArray(args[0])).toBe(true);
        expect(args[1]).toBe(true);
    });

    it("only initializes architecture canvas; DF nodes untouched even with edges present", () => {
        const dfN = node("d1", { data: { type: "data_flow" } });
        const dfE = edge("de1", "d1", "d1", { data: { type: "data_flow" } });
        const pd = {
            id: "p3",
            canvas: [
                archCanvas({
                    nodes: [node("a1")],
                    edges: [edge("e1", "a1", "a1")],
                }),
                dfCanvas({ nodes: [dfN], edges: [dfE] }),
            ],
        };
        const out = getProcessedProjectDiagram(pd as any, false);
        const d0 = out.canvas.find((c) => c.canvas_type === CanvasType.data_flow)!;
        expect(d0.nodes[0]).toStrictEqual(dfN);
        expect(d0.edges[0]).toStrictEqual(dfE);
    });
});

describe("getFilteredCanvasNodesOrEdges", () => {
    it("filters by data.type matching canvas_type", () => {
        const elems = [node("n1"), node("n2", { data: { type: "data_flow" } })];
        const resArch = getFilteredCanvasNodesOrEdges(elems, "architecture" as any);
        const resDF = getFilteredCanvasNodesOrEdges(elems, "data_flow" as any);
        expect(resArch.map((n) => n.id)).toEqual(["n1"]);
        expect(resDF.map((n) => n.id)).toEqual(["n2"]);
    });

    it("returns [] if canvas_type missing", () => {
        expect(getFilteredCanvasNodesOrEdges([node("x")], undefined)).toEqual([]);
    });

    it("handles elements missing data or type gracefully", () => {
        const elems = [{ id: "x" }, { id: "y", data: {} }, node("z")];
        const res = getFilteredCanvasNodesOrEdges(elems as any, CanvasType.architecture);
        // only the proper architecture-typed node passes
        expect(res.map((e: any) => e.id)).toEqual(["z"]);
    });
});

describe("updateXYPositionAfterPasteOp", () => {
    it("keeps shifting until a free spot is found", () => {
        const existing = node("n1", { position: { x: 0, y: 0 } });
        const pasted = node("p1", { position: { x: 0, y: 0 } });

        updateXYPositionAfterPasteOp({ allNodes: [existing], node: pasted });
        expect(pasted.position.x).toBe(10);
        expect(pasted.position.y).toBe(20);
    });

    it("keeps shifting past multiple collisions until a free slot", () => {
        const n1 = node("n1", { position: { x: 10, y: 20 } }); // 1st collision
        const n2 = node("n2", { position: { x: 20, y: 40 } }); // 2nd collision
        const n3 = node("n3", { position: { x: 30, y: 60 } }); // 3rd collision
        const pasted = node("p1", { position: { x: 0, y: 0 } });
        // posUtil.getNodePositionAbsolute returns node.position (hoisted mock)

        updateXYPositionAfterPasteOp({ allNodes: [n1, n2, n3], node: pasted });
        // Should land at (40, 80), the first free after three bumps
        expect(pasted.position).toEqual({ x: 40, y: 80 });
    });
});

describe("getUpdatedNodesAndEdgesAfterPasteOp", () => {
    it("clones nodes/edges, remaps ids, deselects existing, selects new", () => {
        const selectedCanvas = archCanvas();
        const canvasNodes = [node("n1", { selected: true })];
        const canvasEdges: DiagramEdge[] = [edge("e1", "n1", "n1", { selected: true })];
        const clipboard = {
            nodes: [node("c1")],
            edges: [edge("ce1", "c1", "c1")],
        };
        const allNodes = [...canvasNodes, ...clipboard.nodes];

        const out = getUpdatedNodesAndEdgesAfterPasteOp({
            allNodes,
            canvasEdges,
            canvasNodes,
            clipboard,
            selectedCanvas: selectedCanvas as any,
        });

        expect(out.canvasNodes[0].selected).toBe(false);
        expect(out.canvasEdges[0].selected).toBe(false);

        const newNode = out.canvasNodes.find((n) => n.id.startsWith("node_"));
        expect(newNode?.selected).toBe(true);
        const newEdge = out.canvasEdges.find((e) => e.id.startsWith("edge_"));
        expect(newEdge?.selected).toBe(true);
        expect(newEdge?.source.startsWith("node_")).toBe(true);
        expect(newEdge?.target.startsWith("node_")).toBe(true);
    });

    it("throws if selectedCanvas is wrong type", () => {
        const badCanvas = dfCanvas();
        const args = {
            allNodes: [],
            canvasEdges: [],
            canvasNodes: [],
            clipboard: { nodes: [], edges: [] },
            selectedCanvas: badCanvas as any,
        };
        expect(() => getUpdatedNodesAndEdgesAfterPasteOp(args as any)).toThrowError(
            /Paste action can only be performed/
        );
    });

    it("remaps parentId to the newly generated node ids", () => {
        const selectedCanvas = archCanvas();
        const parent = node("cParent");
        const child = node("cChild", { parentId: "cParent" });
        const clipboard = { nodes: [parent, child], edges: [] };
        const out = getUpdatedNodesAndEdgesAfterPasteOp({
            allNodes: [],
            canvasEdges: [],
            canvasNodes: [],
            clipboard,
            selectedCanvas: selectedCanvas as any,
        });

        const newParent = out.canvasNodes.find(
            (n) => n.id !== "cParent" && n.id.startsWith("node_")
        )!;
        const newChild = out.canvasNodes.find((n) => n.parentId === newParent.id)!;
        expect(newChild).toBeTruthy();
    });

    it("throws if selectedCanvas lacks canvas_type", () => {
        expect(() =>
            getUpdatedNodesAndEdgesAfterPasteOp({
                allNodes: [],
                canvasEdges: [],
                canvasNodes: [],
                clipboard: { nodes: [], edges: [] },
                // @ts-expect-error simulate bad shape
                selectedCanvas: {},
            })
        ).toThrowError(/Canvas type is undefined/);
    });
});

describe("getUpdatedDiagramPostDeleteNodesOps", () => {
    const mkSectionRef = (diagram: any, selectedCanvas: any) =>
        ({
            current: {
                projectDiagram: diagram,
                diagramBodyContext: {
                    updateProjectDiagram: vi.fn(),
                    updateCanvas: vi.fn(),
                },
                diagramElementActionContext: {
                    handleSetProcessedNodesAndEdges: vi.fn(),
                },
                diagramCanvasContext: {
                    nodes: selectedCanvas.nodes,
                    edges: selectedCanvas.edges,
                },
            },
        }) as unknown as React.RefObject<any>;

    it("removes selected nodes and associated edges; hides on DF canvas", () => {
        const a1 = node("a1");
        const a2 = node("a2");
        const e1 = edge("e1", "a1", "a2");
        const diagram = {
            canvas: [archCanvas({ nodes: [a1, a2], edges: [e1] }), dfCanvas()],
        };
        const selectedCanvas = diagram.canvas[0];

        const out = getUpdatedDiagramPostDeleteNodesOps({
            projectDiagram: diagram as any,
            context__nodes: selectedCanvas.nodes,
            context__edges: selectedCanvas.edges,
            selectedCanvas,
            resetOverlappingLineSegments: vi.fn(),
            selectedNodeIdList: ["a1"],
            selectedEdgeIdList: [],
        });

        const outArch = out.canvas[0];
        expect(outArch.nodes.map((n: any) => n.id)).toEqual(["a2"]);
        expect(outArch.edges).toHaveLength(0);
    });

    it("hides nodes on data_flow canvas instead of removing", () => {
        const dfN1 = node("d1", { data: { type: "data_flow" } });
        const dfN2 = node("d2", { data: { type: "data_flow" } });
        const df = dfCanvas({ nodes: [dfN1, dfN2], edges: [] });
        const diagram = { canvas: [df] };

        const out = getUpdatedDiagramPostDeleteNodesOps({
            projectDiagram: diagram as any,
            context__nodes: df.nodes,
            context__edges: df.edges,
            selectedCanvas: df,
            resetOverlappingLineSegments: vi.fn(),
            selectedNodeIdList: ["d1"],
            selectedEdgeIdList: [],
        });

        const outDf = out.canvas[0];
        const d1 = outDf.nodes.find((n: any) => n.id === "d1")!;
        const d2 = outDf.nodes.find((n: any) => n.id === "d2")!;
        expect(d1.hidden).toBe(true);
        expect(d2.hidden).toBeFalsy();
    });

    it("removes edges connected to deleted nodes and prunes edges with missing endpoints", () => {
        const a1 = node("a1");
        const a2 = node("a2");
        const a3 = node("a3");
        // e12 will be removed because a1 deleted; e23 remains; e3x pruned (dangling)
        const e12 = edge("e12", "a1", "a2");
        const e23 = edge("e23", "a2", "a3");
        const e3x = edge("e3x", "a3", "ghost"); // ghost target not in allNodeIdList
        const arch = archCanvas({
            nodes: [a1, a2, a3],
            edges: [e12, e23, e3x],
        });
        const diagram = { canvas: [arch] };

        const out = getUpdatedDiagramPostDeleteNodesOps({
            projectDiagram: diagram as any,
            context__nodes: arch.nodes,
            context__edges: arch.edges,
            selectedCanvas: arch,
            resetOverlappingLineSegments: vi.fn(),
            selectedNodeIdList: ["a1"],
            selectedEdgeIdList: [],
        });

        const edgesLeft = out.canvas[0].edges.map((e: any) => e.id);
        expect(edgesLeft).toEqual(["e23"]); // only valid & connected edge remains
    });

    it("calls checkIfEdgeCanBeDeleted for selected edges", () => {
        const a1 = node("a1");
        const a2 = node("a2");
        const e1 = edge("e1", "a1", "a2");
        const arch = archCanvas({ nodes: [a1, a2], edges: [e1] });
        const diagram = { canvas: [arch] };

        getUpdatedDiagramPostDeleteNodesOps({
            projectDiagram: diagram as any,
            context__nodes: arch.nodes,
            context__edges: arch.edges,
            selectedCanvas: arch,
            resetOverlappingLineSegments: vi.fn(),
            selectedNodeIdList: [],
            selectedEdgeIdList: ["e1"],
        });

        expect(edgeUtil.checkIfEdgeCanBeDeleted).toHaveBeenCalledTimes(1);
    });
});

describe("processDeleteCanvasNodesAndEdges / processDeleteAllNodesAndEdges", () => {
    const mkSectionRef = (diagram: any, selectedCanvas: any) => {
        const updateCanvas = vi.fn();
        const updateProjectDiagram = vi.fn();
        const handleSetProcessedNodesAndEdges = vi.fn();

        return {
            current: {
                projectDiagram: diagram,
                diagramBodyContext: { updateCanvas, updateProjectDiagram },
                diagramElementActionContext: {
                    handleSetProcessedNodesAndEdges,
                },
                diagramCanvasContext: {
                    nodes: selectedCanvas.nodes,
                    edges: selectedCanvas.edges,
                },
            },
        } as unknown as React.RefObject<any>;
    };

    it("processDeleteCanvasNodesAndEdges updates canvas and calls handler", async () => {
        const diagram = {
            canvas: [
                archCanvas({
                    nodes: [node("a1"), node("a2")],
                    edges: [edge("e1", "a1", "a2")],
                }),
            ],
        };
        const selectedCanvas = diagram.canvas[0];
        const updateCanvas = vi.fn();
        const handleSetProcessedNodesAndEdges = vi.fn();
        const resetOverlappingLineSegments = vi.fn();

        const updated = await processDeleteCanvasNodesAndEdges({
            projectDiagram: diagram as any,
            updateCanvas,
            selectedCanvasId: selectedCanvas.canvas_id,
            handleSetProcessedNodesAndEdges,
            context__nodes: selectedCanvas.nodes,
            context__edges: selectedCanvas.edges,
            selectedCanvas,
            resetOverlappingLineSegments,
            selectedNodeIdList: ["a1"],
            selectedEdgeIdList: [],
        });

        expect(updated.canvas[0].nodes.map((n: any) => n.id)).toEqual(["a2"]);
        expect(updateCanvas).toHaveBeenCalled();
        expect(handleSetProcessedNodesAndEdges).toHaveBeenCalled();
    });

    it("processDeleteAllNodesAndEdges updates whole project diagram", async () => {
        const diagram = {
            canvas: [
                archCanvas({
                    nodes: [node("a1"), node("a2")],
                    edges: [edge("e1", "a1", "a2")],
                }),
            ],
        };
        const selectedCanvas = diagram.canvas[0];
        const updateProjectDiagram = vi.fn();
        const handleSetProcessedNodesAndEdges = vi.fn();
        const resetOverlappingLineSegments = vi.fn();

        await processDeleteAllNodesAndEdges({
            projectDiagram: diagram as any,
            updateProjectDiagram,
            selectedCanvasId: selectedCanvas.canvas_id,
            handleSetProcessedNodesAndEdges,
            context__nodes: selectedCanvas.nodes,
            context__edges: selectedCanvas.edges,
            selectedCanvas,
            resetOverlappingLineSegments,
            selectedNodeIdList: ["a1"],
            selectedEdgeIdList: [],
        });

        expect(updateProjectDiagram).toHaveBeenCalledWith({
            canvas: expect.any(Array),
        });
    });
});

describe("processDeleteAllNodesAndEdges (guards + calls)", () => {
    it("returns early if selectedCanvas has no canvas_type", async () => {
        const diagram = { canvas: [archCanvas()] };
        const sectionRef = {
            current: {
                projectDiagram: diagram,
                diagramBodyContext: { updateProjectDiagram: vi.fn() },
                diagramElementActionContext: {
                    handleSetProcessedNodesAndEdges: vi.fn(),
                },
            },
        } as unknown as React.RefObject<any>;

        await processDeleteAllNodesAndEdges({
            sectionRef,
            selectedNodeIdList: ["a1"],
            selectedEdgeIdList: [],
        });

        expect(sectionRef.current.diagramBodyContext.updateProjectDiagram).not.toHaveBeenCalled();
        expect(
            sectionRef.current.diagramElementActionContext.handleSetProcessedNodesAndEdges
        ).not.toHaveBeenCalled();
    });
});

describe("processDeleteCanvasNodesAndEdges (errors)", () => {
    it("throws 'Canvas not found.' when selectedCanvasId missing in updated diagram", async () => {
        const arch = archCanvas({
            canvas_id: "arch-1",
            nodes: [node("a1"), node("a2")],
            edges: [edge("e1", "a1", "a2")],
        });
        const diagram = { canvas: [arch] };

        const sectionRef = {
            current: {
                projectDiagram: diagram,
                diagramBodyContext: {
                    updateCanvas: vi.fn(),
                    updateProjectDiagram: vi.fn(),
                },
                diagramElementActionContext: {
                    handleSetProcessedNodesAndEdges: vi.fn(),
                },
                diagramCanvasContext: { nodes: arch.nodes, edges: arch.edges },
            },
        } as unknown as React.RefObject<any>;

        await expect(
            processDeleteCanvasNodesAndEdges({
                sectionRef,
                selectedNodeIdList: ["a1"],
                selectedEdgeIdList: [],
            })
        ).rejects.toThrow(/Canvas not found/);
    });
});

describe("processProjectDiagram", () => {
    it("normalizes node dims, clears selections, and calls view-only updater", () => {
        const pd = {
            id: "p1",
            canvas: [
                archCanvas({
                    nodes: [
                        {
                            ...node("a1"),
                            selected: true,
                            width: undefined,
                            height: undefined,
                            style: { width: 120, height: 80 },
                        },
                    ],
                    edges: [{ ...edge("e1", "a1", "a1"), selected: true }],
                }),
            ],
        };

        const out = processProjectDiagram({
            projectDiagram: pd as any,
            dispatch: vi.fn() as any,
        });

        const a = out.canvas[0];
        expect(a.nodes[0].selected).toBe(false);
        expect(a.nodes[0].width).toBe(120);
        expect(a.nodes[0].height).toBe(80);
        expect(a.nodes[0].extent).toEqual([
            [-Infinity, -Infinity],
            [Infinity, Infinity],
        ]);
        expect(a.edges[0].selected).toBe(false);
        expect(canvasUtil.updateCanvasViewOnly).toHaveBeenCalledTimes(1);
        expect(diagramSvc.patchProjectDiagram).not.toHaveBeenCalled();
    });

    it("uses recalculated project diagram when DF update is required without persisting from the loader", () => {
        const recalculatedDiagram = { canvas: [archCanvas()] };
        (canvasUtil.updateDFCanvas as unknown as Mock).mockReturnValueOnce({
            __projectDiagram: recalculatedDiagram,
            updateDF: true,
        });
        const out = processProjectDiagram({
            projectDiagram: { canvas: [archCanvas()] } as any,
            dispatch: vi.fn() as any,
        });
        expect(diagramSvc.patchProjectDiagram).not.toHaveBeenCalled();
        expect(canvasUtil.updateCanvasViewOnly).toHaveBeenCalledWith(recalculatedDiagram);
        expect(out).toBe(recalculatedDiagram);
        expect(out.canvas.length).toBe(1);
    });

    it("returns recalculated DF canvases so hidden nodes are not left stale in store", () => {
        const staleDiagram = {
            canvas: [
                archCanvas(),
                dfCanvas({
                    nodes: [node("df1", { hidden: true })],
                    edges: [],
                }),
            ],
        };
        const recalculatedDiagram = {
            canvas: [
                archCanvas(),
                dfCanvas({
                    nodes: [node("df1", { hidden: false })],
                    edges: [],
                }),
            ],
        };

        (canvasUtil.updateDFCanvas as unknown as Mock).mockReturnValueOnce({
            __projectDiagram: recalculatedDiagram,
            updateDF: true,
        });

        const out = processProjectDiagram({
            projectDiagram: staleDiagram as any,
            dispatch: vi.fn() as any,
        });

        expect(out.canvas[1].nodes[0].hidden).toBe(false);
    });

    it("preserves existing numeric width/height over style, and preserves existing extent", () => {
        const withDims = {
            ...node("a1"),
            selected: true,
            width: 300,
            height: 200,
            style: { width: 120, height: 80 },
            extent: [
                [-1, -1],
                [1, 1],
            ],
        };
        const pd = {
            id: "pDim",
            canvas: [archCanvas({ nodes: [withDims], edges: [] })],
        };

        const out = processProjectDiagram({
            projectDiagram: pd as any,
            dispatch: vi.fn() as any,
        });
        const n = out.canvas[0].nodes[0];
        expect(n.selected).toBe(false);
        expect(n.width).toBe(300); // not overwritten by style
        expect(n.height).toBe(200);
        expect(n.extent).toEqual([
            [-1, -1],
            [1, 1],
        ]); // preserved
        expect(canvasUtil.updateCanvasViewOnly).toHaveBeenCalledTimes(1);
    });
});
