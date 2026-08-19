import { Position, type Edge as RFEdge } from "@xyflow/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DEFAULT_GAP_OFFSET,
    DEFAULT_ZINDEX_EDGE,
    DESELECTED_EDGE_OPACITY,
    SELECTED_NODE_EDGE_OPACITY,
    STAGGER_SPACING,
} from "#root/constants/diagram";
import { DiagramEdge, NodeHandleEdgeMappingDict } from "#root/interfaces/diagram";
import { CanvasType, EdgeHandleType } from "#root/interfaces/diagram";

// ---- shared mocks (mirror main test file)
const handlePosMock = vi.fn<(id: string) => Position>();
vi.mock("./diagramNodeUtil", () => ({
    getPositionFromHandleId: (id: string) => handlePosMock(id),
}));

const posMock = vi.fn<(args: { allNodes?: any[]; node: any }) => XYPosition>();
vi.mock("./diagramNodePositionUtil", () => ({
    getNodePositionAbsolute: (args: { allNodes?: any[]; node: any }) => posMock(args),
}));

const {
    getAuthorizedEdges,
    evalGetEdgePropsFunc,
    getArchitectureCanvasEdgeProps,
    getDataFlowCanvasEdgeProps,
    getSummaryCanvasEdgeProps,
    getThreatScenarioCanvasEdgeProps,
    getHandlePosition,
    getPoints,
    getOverlappingEdgesInOrder,
    getInitializedDiagramEdge,
    getInitializedDiagramEdges,
    getSelectedViewEdges,
    getProcessedEdges,
    getInitFirstSplineVector,
    computeCurrentPoint,
    getBaseEdgeProps,
    getEdgeCenter,
} = await import("./diagramEdgeUtil");

// ---- helpers
const makeNode = (id: string, x: number, y: number, w = 100, h = 80) =>
    ({ id, position: { x, y }, style: { width: w, height: h } }) as any;

const makeEdge = (overrides: Partial<DiagramEdge> = {}): DiagramEdge =>
    ({
        id: overrides.id ?? "e1",
        source: overrides.source ?? "n1",
        target: overrides.target ?? "n2",
        sourceHandle: overrides.sourceHandle ?? EdgeHandleType.source_bottom,
        targetHandle: overrides.targetHandle ?? EdgeHandleType.target_top,
        data: overrides.data ?? { type: CanvasType.architecture as any },
        style: overrides.style,
        deletable: overrides.deletable,
        selectable: overrides.selectable,
        zIndex: overrides.zIndex,
        animated: overrides.animated,
        type: overrides.type ?? "custom",
        className: overrides.className,
        markerEnd: overrides.markerEnd as any,
    }) as any;

const canvas = (type: CanvasType, view_only = false) =>
    ({ id: `c-${type}`, canvas_type: type, view_only }) as any;

beforeEach(() => {
    handlePosMock.mockImplementation((id) => {
        if (id.includes("top")) return Position.Top;
        if (id.includes("bottom")) return Position.Bottom;
        if (id.includes("left")) return Position.Left;
        if (id.includes("right")) return Position.Right;
        return Position.Bottom;
    });
    posMock.mockImplementation(({ node }) => (node as any).position as XYPosition);
});

// ---- tiny utilities

describe("getAuthorizedEdges (authorized path)", () => {
    it("returns edges unchanged when isAuthorized.update=true", () => {
        const edges = [makeEdge({ deletable: true, selectable: true })];
        const out = getAuthorizedEdges(edges, { update: true } as any);
        expect(out[0].deletable).toBe(true);
        expect(out[0].selectable).toBe(true);
    });
});

describe("style precedence in getSelectedViewEdges", () => {
    it("edgePropsFunc.style overrides edge.style on conflicts", () => {
        const e = makeEdge({
            data: { type: CanvasType.data_flow as any },
            style: { opacity: 0.1, strokeWidth: 2 },
        });
        const selected = canvas(CanvasType.data_flow, false);
        const out = getSelectedViewEdges(
            [e],
            [selected],
            () => ({
                deletable: true,
                style: { opacity: 0.75 }, // should beat 0.1
            }),
            selected
        );
        expect(out[0].style?.strokeWidth).toBe(2);
        expect(out[0].style?.opacity).toBe(0.75);
        expect(out[0].deletable).toBe(true);
    });
});

describe("edge prop getters (view_only=true branches)", () => {
    it("architecture returns non-interactive when view_only", () => {
        const res = getArchitectureCanvasEdgeProps({
            selectedCanvas: canvas(CanvasType.architecture, true),
            edge: makeEdge({ data: { type: CanvasType.architecture as any } }),
            canvas: [] as any,
        } as any);
        expect(res).toMatchObject({
            selectable: false,
            deletable: false,
            zIndex: DEFAULT_ZINDEX_EDGE + 1,
            style: { opacity: SELECTED_NODE_EDGE_OPACITY },
        });
    });

    it("data_flow returns interactive when not view_only and DF type", () => {
        const res = getDataFlowCanvasEdgeProps({
            selectedCanvas: canvas(CanvasType.data_flow, false),
            edge: makeEdge({ data: { type: CanvasType.data_flow as any } }),
            canvas: [] as any,
        } as any);
        expect(res).toMatchObject({
            selectable: true,
            deletable: true,
            zIndex: DEFAULT_ZINDEX_EDGE + 1,
            style: { opacity: SELECTED_NODE_EDGE_OPACITY },
        });
    });

    it("summary is always read-only", () => {
        const res = getSummaryCanvasEdgeProps({} as any);
        expect(res).toMatchObject({
            selectable: false,
            deletable: false,
            zIndex: DEFAULT_ZINDEX_EDGE,
        });
    });

    it("threat_scenario selects non-architecture", () => {
        const res = getThreatScenarioCanvasEdgeProps({
            edge: makeEdge({ data: { type: CanvasType.data_flow as any } }),
        } as any);
        expect(res.style?.opacity).toBe(SELECTED_NODE_EDGE_OPACITY);
    });
});

describe("getDataFlowCanvasEdgeProps (default branch)", () => {
    it("dims non-DF, non-Arch edges on DF canvas", () => {
        const res = getDataFlowCanvasEdgeProps({
            selectedCanvas: canvas(CanvasType.data_flow, false),
            edge: makeEdge({ data: { type: CanvasType.summary as any } }),
            canvas: [] as any,
        } as any);

        expect(res).toMatchObject({
            deletable: false,
            selectable: false,
            zIndex: DEFAULT_ZINDEX_EDGE,
            style: { opacity: DESELECTED_EDGE_OPACITY },
        });
    });
});

describe("evalGetEdgePropsFunc (unknown type)", () => {
    it("returns noop for unknown canvas types", () => {
        const fn = evalGetEdgePropsFunc("??? " as any);
        expect(fn({} as any)).toEqual({});
    });
});

describe("getProcessedEdges (no filters)", () => {
    it("returns canvas edges only when filters disabled and canvas is architecture", () => {
        const pd = { canvas: [canvas(CanvasType.architecture, false)] } as any;
        const archEdge = makeEdge({
            id: "only",
            data: { type: CanvasType.architecture as any },
        });
        const result = getProcessedEdges({
            projectDiagram__isAuthorized: {} as any,
            projectDiagram: pd,
            canvasEdges: [archEdge],
            selectedCanvas: canvas(CanvasType.architecture, false),
            architectureEdges: [makeEdge({ id: "ignored" })],
            filterAuthorizedEdges: false,
            filterSelectedViewEdges: false,
        });
        expect(result.map((e) => e.id)).toEqual(["only"]);
    });
});

describe("getHandlePosition (deterministic staggering)", () => {
    const base: RFEdge = {
        id: "E",
        source: "a",
        target: "b",
        sourceHandle: EdgeHandleType.source_left,
        targetHandle: EdgeHandleType.target_left,
    } as any;

    it("Bottom staggers X within one spacing and offsets Y outward", () => {
        const r = getHandlePosition(["x", "y"], base, EdgeHandleType.target_bottom, 300, 400);
        const dx = Math.abs(r.staggeredX - 300);
        expect(dx).toBeGreaterThan(0);
        expect(dx).toBeLessThanOrEqual(STAGGER_SPACING);
        expect(r.staggeredY).toBeGreaterThan(400);
    });

    it("Unknown handle keeps coordinates unchanged", () => {
        const r = getHandlePosition([], base, "not-a-handle", 123, 456);
        expect(r).toEqual({ staggeredX: 123, staggeredY: 456 });
    });
});

describe("getInitFirstSplineVector", () => {
    it("left/right → ±x; top/bottom → ±y", () => {
        expect(
            getInitFirstSplineVector({
                source: { x: 10, y: 0 },
                target: { x: 50, y: 0 },
                sourcePosition: Position.Left,
            })
        ).toEqual({ x: 1, y: 0 });

        expect(
            getInitFirstSplineVector({
                source: { x: 80, y: 0 },
                target: { x: 50, y: 0 },
                sourcePosition: Position.Right,
            })
        ).toEqual({ x: -1, y: 0 });

        expect(
            getInitFirstSplineVector({
                source: { x: 0, y: 10 },
                target: { x: 0, y: 50 },
                sourcePosition: Position.Top,
            })
        ).toEqual({ x: 0, y: 1 });

        expect(
            getInitFirstSplineVector({
                source: { x: 0, y: 70 },
                target: { x: 0, y: 50 },
                sourcePosition: Position.Bottom,
            })
        ).toEqual({ x: 0, y: -1 });
    });
});

describe("getPoints (same-side path: maxX >= maxY vs maxY > maxX)", () => {
    it("x-dominant: Right->Right centers horizontally and fixes Y to bend Y", () => {
        const source = { x: 0, y: 0 };
        const target = { x: 200, y: 5 };

        const [pts, cx, cy] = getPoints({
            source,
            sourcePosition: Position.Right,
            target,
            targetPosition: Position.Right,
            center: {},
        });

        // reconstruct extended points to verify cx/cy formulae
        const sGE = { x: source.x + 1 + DEFAULT_GAP_OFFSET, y: source.y + 0 }; // Right: +1 on x, +GAP on x
        const tGE = { x: target.x + 1 + DEFAULT_GAP_OFFSET, y: target.y + 0 };

        // x-dominant branch sets cx to mid of extended x's, cy to points[0].y
        expect(cx).toBeCloseTo((sGE.x + tGE.x) / 2);
        expect(cy).toBe(pts[1].y); // bend segment y
    });

    it("y-dominant: Top->Top centers vertically and fixes X to bend X", () => {
        const source = { x: 10, y: 10 };
        const target = { x: 20, y: 210 };

        const [pts, cx, cy] = getPoints({
            source,
            sourcePosition: Position.Top,
            target,
            targetPosition: Position.Top,
            center: {},
        });

        // Top: -1 on y, -GAP on y
        const sGEy = source.y - 1 - DEFAULT_GAP_OFFSET;
        const tGEy = target.y - 1 - DEFAULT_GAP_OFFSET;

        // y-dominant branch sets cy to avg of extended y's, cx to the bend's X
        expect(cy).toBeCloseTo((sGEy + tGEy) / 2);

        // bend point is inserted at index 2
        expect(cx).toBe(pts[2].x);
    });
});

describe("getPoints (opposite-handles with explicit center override)", () => {
    it("uses provided center.x/center.y when given", () => {
        const [, cx, cy] = getPoints({
            source: { x: 0, y: 0 },
            sourcePosition: Position.Bottom,
            target: { x: 100, y: 50 },
            targetPosition: Position.Top,
            center: { x: 999, y: 777 },
        });
        expect(cx).toBe(999);
        expect(cy).toBe(777);
    });
});

describe("getPoints + getEdgeCenter", () => {
    it("exposes center and offsets", () => {
        const { centerX, centerY, xOffset, yOffset } = getEdgeCenter({
            sourceX: 0,
            sourceY: 0,
            targetX: 100,
            targetY: 40,
        });
        expect(centerX).toBe(50);
        expect(centerY).toBe(20);
        expect(xOffset).toBe(50);
        expect(yOffset).toBe(20);

        const [pts, cx, cy, dx, dy] = getPoints({
            source: { x: 0, y: 0 },
            sourcePosition: Position.Bottom,
            target: { x: 100, y: 40 },
            targetPosition: Position.Top,
            center: {},
        });
        expect(Array.isArray(pts)).toBe(true);
        expect(typeof cx).toBe("number");
        expect(typeof cy).toBe("number");
        expect(dx).toBeCloseTo(50);
        expect(dy).toBeCloseTo(20);
    });
});

describe("computeCurrentPoint (staggering via mapping)", () => {
    it("applies staggering based on overlapping arrays", () => {
        const currentEdge = makeEdge({
            id: "E-main",
            source: "n1",
            target: "n2",
            sourceHandle: EdgeHandleType.source_right,
            targetHandle: EdgeHandleType.target_left,
        });
        const maps: NodeHandleEdgeMappingDict = {
            n1: {
                node_id: "n1",
                handles: { [EdgeHandleType.source_right]: ["a", "b"] },
            },
            n2: { node_id: "n2", handles: { [EdgeHandleType.target_left]: ["c"] } },
        } as any;

        const [pts] = computeCurrentPoint({
            currentEdge: currentEdge as any,
            edgeProps: {
                sourceHandleId: EdgeHandleType.source_right,
                targetHandleId: EdgeHandleType.target_left,
                sourceX: 10,
                sourceY: 20,
                targetX: 110,
                targetY: 20,
            },
            nodeHandleEdgeMapping: maps,
        });
        expect(pts.length).toBeGreaterThan(4);
        // ensure the very first point matches staggered start "around" 10,20 (not equal necessarily)
        expect(Math.abs(pts[0].x - 10)).toBeLessThanOrEqual(STAGGER_SPACING);
    });
});

describe("computeCurrentPoint (zero-overlap path)", () => {
    it("works when no overlapping edge ids exist", () => {
        const maps: NodeHandleEdgeMappingDict = {
            n1: { node_id: "n1", handles: { [EdgeHandleType.source_right]: [] } },
            n2: { node_id: "n2", handles: { [EdgeHandleType.target_left]: [] } },
        } as any;

        const [pts] = computeCurrentPoint({
            currentEdge: makeEdge({
                id: "E0",
                source: "n1",
                target: "n2",
                sourceHandle: EdgeHandleType.source_right,
                targetHandle: EdgeHandleType.target_left,
            }) as any,
            edgeProps: {
                sourceHandleId: EdgeHandleType.source_right,
                targetHandleId: EdgeHandleType.target_left,
                sourceX: 10,
                sourceY: 20,
                targetX: 110,
                targetY: 20,
            },
            nodeHandleEdgeMapping: maps,
        });

        expect(Array.isArray(pts)).toBe(true);
        expect(pts.length).toBeGreaterThan(4);
    });
});

describe("getOverlappingEdgesInOrder (error path + ordering)", () => {
    it("throws when a referenced node is missing", () => {
        const a = makeNode("A", 0, 0);
        const edges = [
            makeEdge({
                source: "B",
                target: "A",
                targetHandle: EdgeHandleType.target_right,
            }),
        ];
        expect(() =>
            getOverlappingEdgesInOrder({
                allNodes: [a],
                edges,
                refNodehandle: EdgeHandleType.target_right,
                refNodeId: "A",
            })
        ).toThrow(/Node not found/);
    });

    it("orders by axis rules (right sorts by y then x)", () => {
        const A = makeNode("A", 200, 0);
        const B = makeNode("B", 100, 50);
        const C = makeNode("C", 300, 60);
        const eB = makeEdge({
            id: "eB",
            source: "B",
            target: "A",
            targetHandle: EdgeHandleType.target_right,
        });
        const eC = makeEdge({
            id: "eC",
            source: "C",
            target: "A",
            targetHandle: EdgeHandleType.target_right,
        });

        const res = getOverlappingEdgesInOrder({
            allNodes: [A, B, C],
            edges: [eC, eB],
            refNodehandle: EdgeHandleType.target_right,
            refNodeId: "A",
        });
        expect(res.map((e) => e.id)).toEqual(["eB", "eC"]);
    });
});

describe("getOverlappingEdgesInOrder (matches on source handle)", () => {
    it("orders by y then x for Left handle", () => {
        const A = makeNode("A", 200, 0);
        const B = makeNode("B", 100, 50);
        const C = makeNode("C", 300, 60);

        const eB = makeEdge({
            id: "eB",
            source: "A",
            target: "B",
            sourceHandle: EdgeHandleType.source_left,
        });
        const eC = makeEdge({
            id: "eC",
            source: "A",
            target: "C",
            sourceHandle: EdgeHandleType.source_left,
        });

        const out = getOverlappingEdgesInOrder({
            allNodes: [A, B, C],
            edges: [eC, eB],
            refNodehandle: EdgeHandleType.source_left,
            refNodeId: "A",
        });

        expect(out.map((e) => e.id)).toEqual(["eB", "eC"]); // 50 < 60
    });
});

describe("getInitializedDiagramEdge(s)", () => {
    it("respects explicit markerEnd, otherwise injects type color", () => {
        const withExplicit = getInitializedDiagramEdge(
            makeEdge({
                markerEnd: { color: "hotpink" } as any,
                data: { type: CanvasType.data_flow as any },
            }) as any
        );
        expect(typeof withExplicit.markerEnd).toBe("object");
        expect((withExplicit.markerEnd as any).color).toBe("hotpink");

        const inferred = getInitializedDiagramEdge(
            makeEdge({
                markerEnd: undefined as any,
                style: undefined,
                data: { type: CanvasType.data_flow as any },
            }) as any
        );
        expect(typeof inferred.markerEnd).toBe("object");
        expect(inferred.style?.stroke).toBeTruthy();
        expect((inferred.markerEnd as any).color).toBe(inferred.style?.stroke);
    });

    it("keeps inferred marker color aligned with a custom line stroke", () => {
        const inferred = getInitializedDiagramEdge(
            makeEdge({
                markerEnd: undefined as any,
                style: { stroke: "#123456" },
                data: { type: CanvasType.data_flow as any },
            }) as any
        );

        expect((inferred.markerEnd as any).color).toBe("#123456");
    });

    it("omits markerStart when edge is not bidirectional", () => {
        const edge = getInitializedDiagramEdge(
            makeEdge({
                markerStart: { type: "arrowclosed", color: "black" } as any,
                data: {
                    type: CanvasType.architecture as any,
                    bidirectional: false,
                } as any,
            }) as any
        );

        expect(edge.markerStart).toBeUndefined();
    });

    it("keeps markerStart when edge is bidirectional", () => {
        const edge = getInitializedDiagramEdge(
            makeEdge({
                markerStart: { type: "arrowclosed", color: "black" } as any,
                data: {
                    type: CanvasType.architecture as any,
                    bidirectional: true,
                } as any,
            }) as any
        );

        expect(edge.markerStart).toMatchObject({
            type: "arrowclosed",
            color: "black",
        });
    });

    it("vectorized wrapper returns [] for empty input", () => {
        expect(getInitializedDiagramEdges([])).toEqual([]);
    });
});

describe("getInitializedDiagramEdge (unknown type color path)", () => {
    it("does not crash when CanvasEdgeColor has no mapping", () => {
        const e = getInitializedDiagramEdge(
            makeEdge({
                data: { type: "totally-unknown" as any },
                style: undefined,
                markerEnd: undefined as any,
            }) as any
        );
        // stroke/marker may be undefined; object still well-formed
        expect(e).toHaveProperty("id");
        expect(e).toHaveProperty("markerEnd");
    });
});

describe("getBaseEdgeProps (shape contract)", () => {
    it("extracts and excludes positional keys from baseEdgeProps", () => {
        const p = {
            id: "x",
            source: "s",
            target: "t",
            sourceX: 1,
            sourceY: 2,
            targetX: 3,
            targetY: 4,
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            sourceHandleId: EdgeHandleType.source_bottom,
            targetHandleId: EdgeHandleType.target_top,
            pathOptions: { foo: 1 },
            animated: true,
            selectable: true,
            deletable: true,
            label: "hi",
        } as any;

        const out = getBaseEdgeProps(p);
        expect(out.id).toBe("x");
        expect(out.animated).toBe(true);
        expect(out.selectable).toBe(true);
        expect(out.baseEdgeProps.label).toBe("hi");
        expect(out.baseEdgeProps).not.toHaveProperty("sourceX");
        expect(out.baseEdgeProps).not.toHaveProperty("targetY");
    });
});
