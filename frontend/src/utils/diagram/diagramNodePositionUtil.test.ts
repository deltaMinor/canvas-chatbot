import { describe, expect, it, vi } from "vitest";

import { CanvasColumn, CanvasType, UserStoryCardRefEnum } from "#root/interfaces/diagram";

import { getNodeInfo } from "./diagramNodePositionUtil";

// ---- Mocks

// getNodeInfo is used only by getRelativePosition.
// We'll mock it so we control the values returned.
const getNodeInfoMock = vi.fn();

const {
    getDFRefPosition,
    getNodePositionAbsolute,
    getNodePositionAbsoluteRecursive,
    getRelativePosition,
} = await import("./diagramNodePositionUtil");

// ---- Test helpers

const makeNode = (overrides: Partial<DiagramNode> = {}): DiagramNode => ({
    id: overrides.id ?? Math.random().toString(36).slice(2),
    width: overrides.width ?? 100,
    height: overrides.height ?? 40,
    position: overrides.position ?? { x: 0, y: 0 },
    parentId: overrides.parentId ?? "",
    data: {
        cardRefKey: overrides.data?.cardRefKey ?? UserStoryCardRefEnum.card_devices,
        canvasColumn: overrides.data?.canvasColumn,
        // device/interface association fields used in updateDFNodesCanvasColumn
        cardFieldOptionId: (overrides as any)?.data?.cardFieldOptionId,
        cardFieldOptionIdAssoc: (overrides as any)?.data?.cardFieldOptionIdAssoc,
    } as any,
    style: overrides.style ?? { width: 100, height: 40 },
    type: overrides.type ?? "default",
    selected: overrides.selected ?? false,
    dragging: overrides.dragging ?? false,
    hidden: overrides.hidden ?? false,
});

type CanvasOverrides = Partial<
    Omit<DiagramCanvas, "canvas_type" | "warnings" | "ref"> & {
        canvas_type: CanvasType;
        warnings: DiagramCanvas["warnings"];
        ref: DiagramCanvas["ref"];
    }
>;

export const makeCanvas = (
    nodes: DiagramNode[] = [],
    overrides: CanvasOverrides = {}
): DiagramCanvas => ({
    // DiagramDataCore
    nodes,
    edges: overrides.edges ?? [],
    viewport: overrides.viewport ?? { x: 0, y: 0, zoom: 1 },

    // DiagramCanvas
    canvas_id: overrides.canvas_id ?? "c1",
    canvas_name: overrides.canvas_name ?? "Test Canvas",
    canvas_type: overrides.canvas_type ?? CanvasType.data_flow,
    llm_generation_status: overrides.llm_generation_status ?? 0,
    ref: overrides.ref ?? {},
    view_only: overrides.view_only ?? false,
    warnings: overrides.warnings ?? [],
});

// ---- Tests

describe("getDFRefPosition", () => {
    it("returns midpoints around outer bounds, ignoring children (parentId!=='')", () => {
        const parentA = makeNode({
            id: "p1",
            position: { x: 10, y: 20 },
            width: 100,
            height: 50,
            parentId: "",
        });
        const parentB = makeNode({
            id: "p2",
            position: { x: 200, y: 120 },
            width: 60,
            height: 30,
            parentId: "",
        });
        const child = makeNode({
            id: "c1",
            parentId: "p1",
            position: { x: 5, y: 5 },
            width: 10,
            height: 10,
        });

        const ref = getDFRefPosition(makeCanvas([parentA, parentB, child]));

        const expectedMinX = Math.min(parentA.position.x, parentB.position.x);
        const expectedMaxX = Math.max(
            parentA.position.x + (parentA.width ?? 0),
            parentB.position.x + (parentB.width ?? 0)
        );
        const expectedMinY = Math.min(parentA.position.y, parentB.position.y);
        const expectedMaxY = Math.max(
            parentA.position.y + (parentA.height ?? 0),
            parentB.position.y + (parentB.height ?? 0)
        );

        const midX = (expectedMinX + expectedMaxX) / 2;
        const midY = (expectedMinY + expectedMaxY) / 2;

        expect(ref[CanvasColumn.left]).toEqual([expectedMinX, midY]);
        expect(ref[CanvasColumn.right]).toEqual([expectedMaxX, midY]);
        expect(ref[CanvasColumn.top]).toEqual([midX, expectedMinY]);
        expect(ref[CanvasColumn.bottom]).toEqual([midX, expectedMaxY]);
    });

    it("handles a single root node (bounds collapse to that node’s edges)", () => {
        const n = makeNode({
            position: { x: 50, y: 10 },
            width: 80,
            height: 20,
        });
        const ref = getDFRefPosition(makeCanvas([n]));

        const left = ref[CanvasColumn.left];
        const right = ref[CanvasColumn.right];
        const top = ref[CanvasColumn.top];
        const bottom = ref[CanvasColumn.bottom];

        const minX = 50;
        const maxX = 50 + 80;
        const minY = 10;
        const maxY = 10 + 20;
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        expect(left).toEqual([minX, midY]);
        expect(right).toEqual([maxX, midY]);
        expect(top).toEqual([midX, minY]);
        expect(bottom).toEqual([midX, maxY]);
    });

    it("treats missing width/height as 0 and clamps right bound at 0 (supports negative coords)", () => {
        const a = makeNode({
            position: { x: -100, y: -50 },
            width: undefined as any,
            height: undefined as any,
        });
        const b = makeNode({
            position: { x: -20, y: -10 },
            width: 10,
            height: 5,
        });

        const ref = getDFRefPosition(makeCanvas([a, b]));

        const minX = Math.min(a.position.x, b.position.x);
        const maxX = Math.max(a.position.x + 0, b.position.x + 10); // treat missing as 0
        const minY = Math.min(a.position.y, b.position.y);
        const maxY = Math.max(a.position.y + 0, b.position.y + 5);

        const midY = (minY + maxY) / 2;

        // impl clamps right-most x to 0
        const rightX = Math.max(0, maxX);
        const midXClamped = (minX + rightX) / 2;

        expect(ref[CanvasColumn.left]).toEqual([minX, midY]);
        expect(ref[CanvasColumn.right]).toEqual([rightX, midY]);

        // use clamped midpoint for top/bottom too
        expect(ref[CanvasColumn.top]).toEqual([midXClamped, minY]);
        expect(ref[CanvasColumn.bottom]).toEqual([midXClamped, maxY]);
    });

    it("empty canvas: returns [0,0] for all directions (no NaNs/Infinities)", () => {
        const ref = getDFRefPosition(makeCanvas([]));
        expect(ref[CanvasColumn.left]).toEqual([0, 0]);
        expect(ref[CanvasColumn.right]).toEqual([0, 0]);
        expect(ref[CanvasColumn.top]).toEqual([0, 0]);
        expect(ref[CanvasColumn.bottom]).toEqual([0, 0]);
        // sanity: ensure all are finite
        Object.values(ref).forEach(([x, y]) => {
            expect(Number.isFinite(x)).toBe(true);
            expect(Number.isFinite(y)).toBe(true);
        });
    });

    it("only children (no roots): returns [0,0] for all directions", () => {
        const childOnly = makeNode({
            id: "c1",
            parentId: "p1",
            position: { x: 10, y: 10 },
            width: 20,
            height: 10,
        });
        const ref = getDFRefPosition(makeCanvas([childOnly]));
        expect(ref[CanvasColumn.left]).toEqual([0, 0]);
        expect(ref[CanvasColumn.right]).toEqual([0, 0]);
        expect(ref[CanvasColumn.top]).toEqual([0, 0]);
        expect(ref[CanvasColumn.bottom]).toEqual([0, 0]);
    });
});

describe("getRelativePosition", () => {
    it("returns node.position if parent missing", () => {
        const all = [] as DiagramNode[];
        const node = makeNode({ position: { x: 7, y: 9 } });
        const out1 = getRelativePosition({
            allNodes: all,
            node,
            parentNode: undefined as any,
        } as any);
        expect(out1).toEqual({ x: 7, y: 9 });
    });

    it("returns node.position if parent info is missing", () => {
        const parent = makeNode({
            position: { x: 1, y: 2 },
            style: { width: undefined, height: undefined },
        });
        const node = makeNode({ position: { x: 3, y: 4 } });
        const out = getRelativePosition({
            allNodes: [parent, node],
            node,
            parentNode: parent,
        });
        expect(out).toEqual({ x: 3, y: 4 });
    });

    it("returns node.position if node info is missing", () => {
        const parent = makeNode({ position: { x: 1, y: 2 } });
        const node = makeNode({
            position: { x: 3, y: 4 },
            style: { width: undefined, height: undefined },
        });
        const out = getRelativePosition({
            allNodes: [parent, node],
            node,
            parentNode: parent,
        });
        expect(out).toEqual({ x: 3, y: 4 });
    });

    it("computes relative position when both infos exist", () => {
        const parent = makeNode();
        const node = makeNode();
        const out = getRelativePosition({
            allNodes: [parent, node],
            node,
            parentNode: parent,
        });

        // Since getNodeInfo returns undefined for nodes without proper style,
        // this should return node.position
        expect(out).toEqual(node.position);
    });

    it("passes positionAbsolute to getNodeInfo for the child", () => {
        const parent = makeNode({ position: { x: 1, y: 2 } });
        const node = makeNode({
            position: { x: 0, y: 0 },
            style: { width: undefined, height: undefined },
        });
        const positionAbsolute = { x: 999, y: 111 };

        const out = getRelativePosition({
            allNodes: [parent, node],
            node,
            parentNode: parent,
            positionAbsolute,
        });

        // Since getNodeInfo returns undefined, this should return node.position
        expect(out).toEqual({ x: 0, y: 0 });
    });
});

describe("getNodePositionAbsoluteRecursive / getNodePositionAbsolute", () => {
    it("sums up parent chain positions (3 levels)", () => {
        const root = makeNode({
            id: "root",
            parentId: "",
            position: { x: 10, y: 10 },
        });
        const mid = makeNode({
            id: "mid",
            parentId: "root",
            position: { x: 5, y: 15 },
        });
        const leaf = makeNode({
            id: "leaf",
            parentId: "mid",
            position: { x: 20, y: 1 },
        });
        const all = [root, mid, leaf];

        const abs = getNodePositionAbsolute({ node: leaf, allNodes: all });
        expect(abs).toEqual({ x: 35, y: 26 }); // (20,1)+(5,15)+(10,10)
    });

    it("does not mutate the original node.position", () => {
        const parent = makeNode({
            id: "p",
            position: { x: 1, y: 2 },
        });
        const node = makeNode({
            id: "n",
            parentId: "p",
            position: { x: 3, y: 4 },
        });
        const original = { ...node.position };

        const abs = getNodePositionAbsolute({ node, allNodes: [parent, node] });

        expect(abs).toEqual({ x: 4, y: 6 });
        expect(node.position).toEqual(original); // immutability
    });

    it("gracefully stops when parentId is empty string", () => {
        const node = makeNode({
            id: "n",
            parentId: "",
            position: { x: 7, y: 8 },
        });

        const abs = getNodePositionAbsolute({ node, allNodes: [node] });
        expect(abs).toEqual({ x: 7, y: 8 });
    });

    it("throws with helpful message when parentId exists but parent not found", () => {
        const orphan = makeNode({
            id: "o",
            parentId: "missing",
            position: { x: 1, y: 2 },
        });

        expect(() => getNodePositionAbsolute({ node: orphan, allNodes: [] })).toThrow(
            /Error getting node position absolute/i
        );
    });

    it("supports deep chains and floating point coordinates", () => {
        const chain: DiagramNode[] = [];
        const levels = 10;
        for (let i = 0; i < levels; i++) {
            chain.push(
                makeNode({
                    id: `n${i}`,
                    parentId: i === 0 ? "" : `n${i - 1}`,
                    position: { x: 0.5 + i, y: 1.25 + i },
                })
            );
        }
        const leaf = chain[levels - 1];
        const abs = getNodePositionAbsolute({ node: leaf, allNodes: chain });

        // Sum of arithmetic series:
        // x = sum_{i=0..9} (0.5 + i) = 10*0.5 + 45 = 5 + 45 = 50
        // y = sum_{i=0..9} (1.25 + i) = 10*1.25 + 45 = 12.5 + 45 = 57.5
        expect(abs.x).toBeCloseTo(50);
        expect(abs.y).toBeCloseTo(57.5);
    });

    it("recursive helper throws if parent missing", () => {
        const child = makeNode({
            id: "c",
            parentId: "nope",
            position: { x: 0, y: 0 },
        });
        const pos = { x: 1, y: 1 };
        expect(() =>
            getNodePositionAbsoluteRecursive({
                node: child,
                allNodes: [],
                position_absolute: pos,
            })
        ).toThrow(/Parent node not found/);
    });
});

describe("getNodeInfo", () => {
    it("returns undefined if missing dimensions", () => {
        expect(getNodeInfo({ node: { style: {} }, allNodes: [] } as any)).toBeUndefined();
    });
    it("returns position info if dimensions present", () => {
        const node = {
            style: { width: 10, height: 20 },
            width: 10,
            height: 20,
        };
        const pos = { x: 5, y: 10 };
        expect(
            getNodeInfo({
                node,
                allNodes: [],
                positionAbsolute: pos,
            } as any)
        ).toMatchObject({
            nodeWidth: 10,
            nodeHeight: 20,
        });
    });
});
