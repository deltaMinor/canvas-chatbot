import { describe, expect, it, vi } from "vitest";

// --- Minimal runtime mocks for the enums used by the SUT --------------------
vi.mock("#root/interfaces/diagram", () => ({
    CanvasNodeType: { data_flow: "data_flow" },
    UserStoryCardRefEnum: {
        card_interface: "card_interface",
        card_users: "card_users",
        card_devices: "card_devices",
    },
}));

// Type-only in the SUT, but mock anyway to avoid resolution issues in some setups
vi.mock("#root/interfaces/diagramContent", () => ({}));

// --- Import the system under test (adjust the path!) ------------------------
const { getToscaType, updateNodeToscaType, getUpdatedDiagramPostUpdateAllToscaOps } =
    await import("./diagramToscaUtil");

// Optionally import mocked enums to build inputs consistent with the SUT checks
const { CanvasNodeType, UserStoryCardRefEnum } = await import("#root/interfaces/diagram");

const makeNode = (overrides: any = {}) => {
    const base = {
        id: overrides.id ?? Math.random().toString(36).slice(2),
        data: {
            type: overrides.data?.type ?? String(CanvasNodeType.data_flow),
            cardRefKey: overrides.data?.cardRefKey ?? String(UserStoryCardRefEnum.card_interface),
            icon: overrides.data?.icon ?? "icon.default",
            tosca_type: overrides.data?.tosca_type,
            tosca_schema: overrides.data?.tosca_schema,
        },
    };
    return {
        ...base,
        ...overrides,
        data: { ...base.data, ...(overrides.data ?? {}) },
    };
};

function assertDefined<T>(v: T, msg?: string): asserts v is NonNullable<T> {
    if (v === undefined || v === null) throw new Error(msg ?? "Expected value");
}

describe("getToscaType", () => {
    const mapping = {
        "icon.user": "custom.UserMapped",
        "icon.compute": "custom.ComputeMapped",
        "icon.other": "x.y.Other",
    };

    it("returns Interface for data_flow interface nodes", () => {
        const n = makeNode({
            data: {
                cardRefKey: String(UserStoryCardRefEnum.card_interface),
            },
        });
        expect(getToscaType({ node: n as any, toscaMapping: mapping })).toBe(
            "arcs.nodes.Interface"
        );
    });

    it("returns User for data_flow users nodes", () => {
        const n = makeNode({
            data: { cardRefKey: String(UserStoryCardRefEnum.card_users) },
        });
        expect(getToscaType({ node: n as any, toscaMapping: mapping })).toBe("arcs.nodes.User");
    });

    it("returns Compute for data_flow devices nodes", () => {
        const n = makeNode({
            data: { cardRefKey: String(UserStoryCardRefEnum.card_devices) },
        });
        expect(getToscaType({ node: n as any, toscaMapping: mapping })).toBe("arcs.nodes.Compute");
    });

    it("falls back to toscaMapping by icon when not matching special cases", () => {
        const n = makeNode({
            data: {
                cardRefKey: "something_else",
                icon: "icon.other",
            },
        });
        expect(getToscaType({ node: n as any, toscaMapping: mapping })).toBe("x.y.Other");
    });

    it("returns empty string when icon not found in mapping", () => {
        const n = makeNode({
            data: { cardRefKey: "none", icon: "unknown.icon" },
        });
        expect(getToscaType({ node: n as any, toscaMapping: mapping })).toBe("");
    });
});

describe("updateNodeToscaType", () => {
    it("writes the computed tosca_type onto the node", () => {
        const mapping = { "icon.compute": "mapped.Compute" };
        const n = makeNode({
            data: { cardRefKey: "none", icon: "icon.compute" },
        });

        updateNodeToscaType({ node: n as any, toscaMapping: mapping });
        expect(n.data.tosca_type).toBe("mapped.Compute");
    });
});

describe("getUpdatedDiagramPostUpdateAllToscaOps", () => {
    const toscaSchema = "tosca_simple_yaml_1_3";
    const mapping = {
        "icon.a": "mapped.A",
        "icon.b": "mapped.B",
    };

    const makeDiagram = (nodes: any[]) =>
        ({
            canvas: [
                {
                    nodes,
                },
            ],
        }) as any;

    it("Clones the diagram, updates only selected nodes, and sets tosca_schema", () => {
        const selected = makeNode({
            id: "a",
            data: { icon: "icon.a", cardRefKey: "none" },
        });
        const other = makeNode({
            id: "b",
            data: { icon: "icon.b", cardRefKey: "none" },
        });

        const original = makeDiagram([selected, other]);

        const updated = getUpdatedDiagramPostUpdateAllToscaOps({
            projectDiagram: original,
            toscaSchema,
            toscaMapping: mapping,
            selectedNodeIdList: ["a"],
        });

        // returns a new object (not the same reference)
        expect(updated).not.toBe(original);

        const nodes = updated.canvas[0].nodes;

        const updatedA = nodes.find((n) => n.id === "a");
        expect(updatedA).toBeDefined();
        if (!updatedA) throw new Error("node a not found");
        expect(updatedA.data.tosca_type).toBe("mapped.A");
        expect(updatedA.data.tosca_schema).toBe(toscaSchema);

        const updatedB = nodes.find((n) => n.id === "b");
        expect(updatedB).toBeDefined();
        if (!updatedB) throw new Error("node b not found");
        expect(updatedB.data.tosca_type).toBeUndefined();
        expect(updatedB.data.tosca_schema).toBeUndefined();

        // original diagram NOT mutated
        const origA = original.canvas[0].nodes.find((n: any) => n.id === "a");
        const origB = original.canvas[0].nodes.find((n: any) => n.id === "b");
        expect(origA.data.tosca_type).toBeUndefined();
        expect(origA.data.tosca_schema).toBeUndefined();
        expect(origB.data.tosca_type).toBeUndefined();
        expect(origB.data.tosca_schema).toBeUndefined();
    });

    it("No-ops when selectedNodeIdList is empty/omitted", () => {
        const n1 = makeNode({ id: "x", data: { icon: "icon.a" } });
        const diagram = makeDiagram([n1]);

        const updated = getUpdatedDiagramPostUpdateAllToscaOps({
            projectDiagram: diagram,
            toscaSchema,
            toscaMapping: mapping,
        });

        const x = updated.canvas[0].nodes.find((n: any) => n.id === "x");
        assertDefined(x, "node x not found"); // TS now knows x is a DiagramNode

        expect(x.data.tosca_type).toBeUndefined();
        expect(x.data.tosca_schema).toBeUndefined();
    });
});
