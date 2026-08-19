import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CanvasType, DiagramCanvas, WarningMessage } from "#root/interfaces/diagram";
import { ScenarioStatusKey } from "#root/interfaces/register";

// Constructor returning deterministic values
const mockGetValues = vi.fn();
vi.mock("#root/lib/SummaryCanvasConstructor", () => ({
    SummaryCanvasConstructor: class MockSummaryCanvasConstructor {
        constructor() {}
        getValues() {
            return mockGetValues();
        }
    },
}));

// DFNodePlacementManager mock
vi.mock("#root/lib/DFNodePlacementManager", () => ({
    DFNodePlacementManager: class MockDFNodePlacementManager {
        nodes: any[];
        constructor(nodes: any[]) {
            this.nodes = nodes;
        }
        setDFNodes() {
            // Return nodes with the expected structure based on the test context
            const nodes = this.nodes || [];
            return nodes.map((n: any) => ({
                ...n,
                data: { ...n.data, canvasColumn: 0 },
                hidden: false,
            }));
        }
    },
}));

// --- Mocks for external deps used by the SUT -------------------------------

// Minimal diagram enum + types
vi.mock("#root/interfaces/diagram", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#root/interfaces/diagram")>();
    return {
        ...actual,
        // shape-only stubs to satisfy type imports in tests
        DiagramNode: {} as any,
        DiagramEdge: {} as any,
        DiagramCanvas: {} as any,
        ProjectDiagram: {} as any,
    };
});

vi.mock("#root/interfaces/register", () => {
    return {
        ScenarioStatusKey: {
            unresolved: "unresolved",
            pendingSupport: "pendingSupport",
            supported: "supported",
        },
    };
});

// Summary canvas template
vi.mock("#root/constants/diagram", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#root/constants/diagram")>();
    return {
        ...actual,
        // keep your template (string "summary" is fine for tests)
        summary_canvas_template: {
            canvas_id: "summary-template",
            canvas_name: "Summary",
            canvas_type: "summary",
            nodes: [],
            edges: [],
            ref: {},
        },
        DEFAULT_DATAFLOW_CANVAS_COLUMN: 0,

        // (optional) add other constants if your SUT references them
        // SUMMARY_INTERFACE_NODE_WIDTH: 0,
        // SUMMARY_INTERFACE_NODE_HEIGHT: 0,
        // SUMMARY_INTERFACE_NODE_SPACING_X: 0,
        // SUMMARY_INTERFACE_NODE_SPACING_Y: 0,
        // MIN_WIDTH_CLUSTERNODE: 0,
        // MIN_HEIGHT_CLUSTERNODE: 0,
        // DATAFLOW_DEVICES_COL_OFFSET_VALUES: { 0: 0, 1: 0, 2: 0 },
        // DATAFLOW_USERS_COL_OFFSET_VALUES: { 0: 0, 1: 0, 2: 0 },
    };
});

// Node position utils used by updateDFCanvas
const mockGetDFRefPosition = vi.fn();
vi.mock("./diagramNodePositionUtil", () => ({
    getDFRefPosition: (...args: any[]) => mockGetDFRefPosition(...args),
}));

// Threat util branches used by reloadCanvas and getCanvasViewOptions
const mockGetSinglePathEdges = vi.fn();
const mockGetMultiPathEdges = vi.fn();
const mockGetTopFiveThreatScenarioCanvases = vi.fn();
vi.mock("./diagramThreatUtil", () => ({
    getSinglePathEdges: (...args: any[]) => mockGetSinglePathEdges(...args),
    getMultiPathEdges: (...args: any[]) => mockGetMultiPathEdges(...args),
    getTopFiveThreatScenarioCanvases: (...args: any[]) =>
        mockGetTopFiveThreatScenarioCanvases(...args),
}));

const mockDispatch = vi.fn();
const mockSetProjectDiagram = vi.fn();
vi.mock("#root/store", () => ({
    app_store: {
        dispatch: (...args: any[]) => mockDispatch(...args),
    },
    app_actions: {
        backend: {
            setProjectDiagram: (...args: any[]) => mockSetProjectDiagram(...args),
        },
    },
}));

const mockGetBackendState = vi.fn();
vi.mock("#root/stores/backendStore", () => ({
    getBackendStateFromStore: () => mockGetBackendState(),
}));

const mockGetDraftCanvasId = vi.fn();
vi.mock("#root/stores/projectDiagram/backend", () => ({
    getDraftCanvasIdFromStore: () => mockGetDraftCanvasId(),
}));

const mockUpdateProjectDiagramInDatabase = vi.fn();
vi.mock("#root/stores/projectDiagramFeaturePersistenceStore", () => ({
    updateProjectDiagramInDatabase: (...args: any[]) => mockUpdateProjectDiagramInDatabase(...args),
}));

// Dummy type imported in file (not used here, just to satisfy module graph)
vi.mock("#root/interfaces/diagramContent", () => ({}));

// --- Import SUT after mocks -------------------------------------------------
const {
    getCanvasTypes,
    getCanvasViewOptions,
    getInitCanvasId,
    getOptionsByKey,
    getSelectedCanvasFromId,
    getUpdatedDFCanvas,
    reloadCanvas,
    updateCanvasViewOnly,
    updateDFCanvas,
} = await import("./diagramCanvasUtil");

// --- Helpers ----------------------------------------------------------------
const makeCanvas = (over: Partial<any> = {}) => ({
    canvas_id: over.canvas_id ?? cryptoRandom("c_"),
    canvas_name: over.canvas_name ?? "Canvas",
    canvas_type: over.canvas_type ?? CanvasType.architecture,
    nodes: over.nodes ?? [],
    edges: over.edges ?? [],
    ref: over.ref ?? {},
    view_only: over.view_only ?? false,
});

const makeDiagram = (canvases: any[] = [], extra: Partial<any> = {}) => ({
    canvas: canvases,
    isCompleted: extra.isCompleted ?? false,
});

function cryptoRandom(prefix = "id_") {
    // simple deterministic-ish helper for tests
    return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("reloadCanvas", () => {
    const handleSetProcessedNodesAndEdges = vi.fn().mockResolvedValue(undefined);
    const baseArgs = (over: Partial<any> = {}) => ({
        projectDiagram: over.projectDiagram ?? makeDiagram([makeCanvas()]),
        selectedCanvas: over.selectedCanvas,
        selectedPath: over.selectedPath,
        viewAllPaths: over.viewAllPaths ?? false,
        hideAllPaths: over.hideAllPaths ?? false,
        handleSetProcessedNodesAndEdges,
        architectureCanvas: over.architectureCanvas ?? makeCanvas(),
    });

    beforeEach(async () => {
        handleSetProcessedNodesAndEdges.mockClear();
        mockGetValues.mockReturnValue({
            summaryNodes: [],
            summaryEdges: [],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        // Mock is set up at module level
    });

    it("short-circuits when no selectedCanvas type", async () => {
        await reloadCanvas(
            baseArgs({
                selectedCanvas: { ...makeCanvas(), canvas_type: undefined },
            }) as any
        );
        expect(handleSetProcessedNodesAndEdges).not.toHaveBeenCalled();
    });

    it("passes through architecture canvas nodes/edges", async () => {
        const selected = makeCanvas({
            canvas_type: CanvasType.architecture,
            nodes: [{ id: "a" }],
            edges: [{ id: "b", source: "a", target: "a" }],
        });
        await reloadCanvas(baseArgs({ selectedCanvas: selected }) as any);
        expect(handleSetProcessedNodesAndEdges).toHaveBeenLastCalledWith(
            expect.objectContaining({
                canvasNodes: selected.nodes,
                canvasEdges: selected.edges,
                funcRef: "DiagramElementActionContext",
            })
        );
    });

    it("uses computed data_flow canvas for data_flow type", async () => {
        const arch = makeCanvas({
            canvas_type: CanvasType.architecture,
            nodes: [{ id: "a" }],
            edges: [{ id: "b", source: "a", target: "a" }],
        });
        const selected = makeCanvas({
            canvas_type: CanvasType.data_flow,
            nodes: [{ id: "a" }],
            edges: [{ id: "b", source: "a", target: "a" }],
        });
        const pd = makeDiagram([arch, selected]);
        await reloadCanvas(
            baseArgs({
                projectDiagram: pd,
                selectedCanvas: selected,
                architectureCanvas: arch,
            }) as any
        );
        expect(handleSetProcessedNodesAndEdges).toHaveBeenLastCalledWith(
            expect.objectContaining({
                canvasNodes: [{ id: "a", data: { canvasColumn: 0 }, hidden: false }],
                canvasEdges: selected.edges,
                funcRef: "DiagramElementActionContext",
            })
        );
    });

    it("uses computed summary canvas for summary type", async () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "sn" }],
            summaryEdges: [{ id: "se", source: "sn", target: "sn" }],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        await reloadCanvas(
            baseArgs({
                selectedCanvas: makeCanvas({ canvas_type: CanvasType.summary }),
            }) as any
        );
        expect(handleSetProcessedNodesAndEdges).toHaveBeenCalledWith(
            expect.objectContaining({
                canvasNodes: [{ id: "sn" }],
                canvasEdges: [{ id: "se", source: "sn", target: "sn" }],
            })
        );
    });

    it("threat_scenario branch: hideAllPaths -> empty edges", async () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "sn" }],
            summaryEdges: [],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        await reloadCanvas(
            baseArgs({
                selectedCanvas: makeCanvas({
                    canvas_type: CanvasType.threat_scenario,
                }),
                hideAllPaths: true,
            }) as any
        );
        expect(handleSetProcessedNodesAndEdges).toHaveBeenCalledWith(
            expect.objectContaining({
                canvasEdges: [],
                canvasNodes: [{ id: "sn" }],
            })
        );
    });

    it("threat_scenario branch: single-path edges when viewAllPaths=false", async () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "x" }],
            summaryEdges: [],
            nodeColumnMapping: { x: 1 },
            positionOffset: { x: 0, y: 0 },
        });

        const single = [{ id: "e1", source: "x", target: "x" }];
        mockGetSinglePathEdges.mockReturnValue(single);

        await reloadCanvas(
            baseArgs({
                selectedCanvas: makeCanvas({
                    canvas_type: CanvasType.threat_scenario,
                }),
                selectedPath: { id: "p1" } as any,
                viewAllPaths: false,
            }) as any
        );

        expect(mockGetSinglePathEdges).toHaveBeenCalled();
        expect(handleSetProcessedNodesAndEdges).toHaveBeenCalledWith(
            expect.objectContaining({
                canvasEdges: single,
                canvasNodes: [{ id: "x" }],
            })
        );
    });

    it("threat_scenario branch: multi-path edges when viewAllPaths=true", async () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "y" }],
            summaryEdges: [],
            nodeColumnMapping: { y: 2 },
            positionOffset: { x: 0, y: 0 },
        });

        const multi = [{ id: "e2", source: "y", target: "y" }];
        mockGetMultiPathEdges.mockReturnValue(multi);

        await reloadCanvas(
            baseArgs({
                selectedCanvas: makeCanvas({
                    canvas_type: CanvasType.threat_scenario,
                }),
                viewAllPaths: true,
            }) as any
        );

        expect(mockGetMultiPathEdges).toHaveBeenCalled();
        expect(handleSetProcessedNodesAndEdges).toHaveBeenCalledWith(
            expect.objectContaining({
                canvasEdges: multi,
                canvasNodes: [{ id: "y" }],
            })
        );
    });
});

describe("updateDFCanvas", () => {
    it("returns original diagram and false when no architecture canvas", () => {
        const pd = makeDiagram([makeCanvas({ canvas_type: CanvasType.data_flow })]);
        const out = updateDFCanvas(pd as any, {} as DiagramCanvas<WarningMessage>);
        expect(out.__projectDiagram).toEqual(pd);
        expect(out.updateDF).toBe(false);
    });

    it("updates DF canvases when nodes hidden or missing canvasColumn", () => {
        const arch = makeCanvas({
            canvas_type: CanvasType.architecture,
            nodes: [{ id: "arch1" }],
        });
        const dfNodes = [{ id: "df1", data: {}, hidden: true }];
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            nodes: dfNodes,
        });
        const pd = makeDiagram([arch, df]);

        mockGetDFRefPosition.mockReturnValue({}); // anything

        const out = updateDFCanvas(pd as any, arch as any);
        expect(out.updateDF).toBe(true);

        // mutated copy, not original reference
        const updated = out.__projectDiagram.canvas.find(
            (c: any) => c.canvas_type === CanvasType.data_flow
        );
        expect(updated?.nodes[0].data.canvasColumn).toBe(0);
        expect(updated?.nodes[0].hidden).toBe(false);
        // original untouched
        expect(pd.canvas[1].nodes[0]).toEqual(dfNodes[0]);
    });

    it("does not update when refresh=false and nodes already ok", () => {
        const arch = makeCanvas({ canvas_type: CanvasType.architecture });
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            nodes: [{ id: "ok", data: { canvasColumn: 1 }, hidden: false }],
        });
        const pd = makeDiagram([arch, df]);

        const out = updateDFCanvas(pd as any, arch as any, false);
        expect(out.updateDF).toBe(false);
        // Mock is set up in beforeEach
    });
});

describe("getUpdatedDFCanvas", () => {
    beforeEach(async () => {
        mockGetDFRefPosition.mockReset();
        // Mock is set up at module level
    });

    it("return original diagram when no architecture canvas", () => {
        const arch = makeCanvas();
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "df0",
            nodes: [{ id: "dfA", hidden: true, data: {} }],
            edges: [{ id: "e", source: "dfA", target: "dfA" }],
        });
        const pd = makeDiagram([arch, df]);

        const result = getUpdatedDFCanvas(pd as any, arch as any, "df0");
        expect(result).toStrictEqual(df);
    });

    it("return updated diagram when selected DF canvas ID is found", () => {
        const arch = makeCanvas({
            canvas_type: CanvasType.architecture,
            nodes: [{ id: "arch1" }],
        });
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "df0",
            nodes: [{ id: "dfA", hidden: true, data: {} }],
            edges: [{ id: "e", source: "dfA", target: "dfA" }],
        });
        const pd = makeDiagram([arch, df]);

        mockGetDFRefPosition.mockReturnValue({});

        const result = getUpdatedDFCanvas(pd as any, arch as any, "df0");
        expect(result).toBeDefined();
        expect(result?.canvas_id).toBe("df0");
        expect(result?.nodes).toHaveLength(1);
        expect(result?.nodes[0]).toMatchObject({
            id: "dfA",
            hidden: false,
            data: { canvasColumn: 0 },
        });
    });

    it("return undefined if selected DF canvas id not found", () => {
        const arch = makeCanvas({
            canvas_type: CanvasType.architecture,
            nodes: [{ id: "arch1" }],
        });
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "dfX",
        });
        const pd = makeDiagram([arch, df]);

        mockGetDFRefPosition.mockReturnValue({});

        const result = getUpdatedDFCanvas(pd as any, arch as any, "df0");
        expect(result).toBeUndefined();
    });
});

describe("getSelectedCanvasFromId", () => {
    it("returns matching canvas by id when type is arch/df/threat", () => {
        const a = makeCanvas({
            canvas_type: CanvasType.architecture,
            canvas_id: "A",
        });
        const d = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "D",
        });
        const t = makeCanvas({
            canvas_type: CanvasType.threat_scenario,
            canvas_id: "T",
        });
        const pd = makeDiagram([a, d, t]);

        expect(
            getSelectedCanvasFromId({
                projectDiagram: pd as any,
                draftCanvasId: "A",
            })
        ).toEqual(a);
        expect(
            getSelectedCanvasFromId({
                projectDiagram: pd as any,
                draftCanvasId: "D",
            })
        ).toEqual(d);
        expect(
            getSelectedCanvasFromId({
                projectDiagram: pd as any,
                draftCanvasId: "T",
            })
        ).toEqual(t);
    });

    it("returns computed summary when id is 'summary'", async () => {
        mockGetValues.mockReturnValue({
            summaryNodes: [{ id: "s" }],
            summaryEdges: [],
            nodeColumnMapping: {},
            positionOffset: { x: 0, y: 0 },
        });

        const pd = makeDiagram([makeCanvas()]);
        const out = getSelectedCanvasFromId({
            projectDiagram: pd as any,
            draftCanvasId: CanvasType.summary,
        })!;
        expect(out.canvas_type).toBe(CanvasType.summary);
        expect(out.nodes).toEqual([{ id: "s" }]);
    });

    it("returns undefined for unknown id", () => {
        const pd = makeDiagram([makeCanvas({ canvas_id: "known" })]);
        expect(
            getSelectedCanvasFromId({
                projectDiagram: pd as any,
                draftCanvasId: "nope",
            })
        ).toBeUndefined();
    });
});

describe("getInitCanvasId", () => {
    it("returns id of first canvas matching canvas_type", () => {
        const a = makeCanvas({
            canvas_type: CanvasType.architecture,
            canvas_id: "A",
        });
        const d = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "D",
        });
        const pd = makeDiagram([a, d]);
        expect(
            getInitCanvasId({
                canvas: pd.canvas as any,
                canvas_type: CanvasType.data_flow,
            })
        ).toBe("D");
    });

    it("falls back to architecture id", () => {
        const a = makeCanvas({
            canvas_type: CanvasType.architecture,
            canvas_id: "A",
        });
        const pd = makeDiagram([a]);
        expect(getInitCanvasId({ canvas: pd.canvas as any })).toBe("A");
    });

    it("returns empty string if nothing matches", () => {
        const pd = makeDiagram([]);
        expect(getInitCanvasId({ canvas: pd.canvas as any })).toBe("");
    });
});

describe("getCanvasTypes", () => {
    it("returns empty when no input", () => {
        expect(getCanvasTypes(undefined)).toEqual([]);
    });
    it("returns only threat_scenario when input is threat_scenario", () => {
        expect(getCanvasTypes(CanvasType.threat_scenario)).toEqual([CanvasType.threat_scenario]);
    });
    it("returns [architecture, data_flow, summary] otherwise", () => {
        expect(getCanvasTypes(CanvasType.architecture)).toEqual([
            CanvasType.architecture,
            CanvasType.data_flow,
            CanvasType.summary,
        ]);
    });
});

describe("getOptionsByKey", () => {
    it("maps canvases with matching threat_scenario_ref.status to label/value pairs", () => {
        const canvases = [
            makeCanvas({
                canvas_name: "One",
                canvas_id: "1",
                ref: {
                    threat_scenario_ref: {
                        status: ScenarioStatusKey.unresolved,
                    },
                },
            }),
            makeCanvas({
                canvas_name: "Two",
                canvas_id: "2",
                ref: {
                    threat_scenario_ref: {
                        status: ScenarioStatusKey.supported,
                    },
                },
            }),
        ];
        const out = getOptionsByKey(canvases as any, ScenarioStatusKey.supported.toString());
        expect(out).toEqual([{ label: "Two", value: "2" }]);
    });
});

describe("getCanvasViewOptions", () => {
    it("groups by type and includes Summary & top-5 threat scenario canvases", () => {
        const arch = makeCanvas({
            canvas_type: CanvasType.architecture,
            canvas_id: "A1",
            canvas_name: "Arch 1",
        });
        const df = makeCanvas({
            canvas_type: CanvasType.data_flow,
            canvas_id: "D1",
            canvas_name: "DF 1",
        });
        const ts1 = makeCanvas({
            canvas_type: CanvasType.threat_scenario,
            canvas_id: "T1",
            canvas_name: "TS 1",
            ref: {
                threat_scenario_ref: { status: ScenarioStatusKey.unresolved },
            },
        });
        const ts2 = makeCanvas({
            canvas_type: CanvasType.threat_scenario,
            canvas_id: "T2",
            canvas_name: "TS 2",
            ref: {
                threat_scenario_ref: { status: ScenarioStatusKey.supported },
            },
        });

        const pdCanvases = [arch, df, ts1, ts2];
        mockGetTopFiveThreatScenarioCanvases.mockReturnValue([ts1, ts2]);

        const out = getCanvasViewOptions(pdCanvases as any, [
            CanvasType.architecture,
            CanvasType.data_flow,
            CanvasType.summary,
            CanvasType.threat_scenario,
        ]);

        // Expect four groups in a predictable order
        expect(out.map((g) => g.label)).toEqual([
            "Architecture",
            "Data Flow",
            CanvasType.summary,
            "Unresolved",
            "Pending Support",
            "Supported",
        ]);

        const archGroup = out.find((g) => g.label === "Architecture")!;
        expect(archGroup.options).toEqual([{ label: "Arch 1", value: "A1" }]);

        const dfGroup = out.find((g) => g.label === "Data Flow")!;
        expect(dfGroup.options).toEqual([{ label: "DF 1", value: "D1" }]);

        const summaryGroup = out.find((g) => g.label === CanvasType.summary)!;
        expect(summaryGroup.options).toEqual([{ label: "Summary", value: CanvasType.summary }]);

        const supported = out.find((g) => g.label === "Supported")!;
        expect(supported.options).toEqual([{ label: "TS 2", value: "T2" }]);
        const unresolved = out.find((g) => g.label === "Unresolved")!;
        expect(unresolved.options).toEqual([{ label: "TS 1", value: "T1" }]);
    });
});

describe("updateCanvasViewOnly", () => {
    it("sets view_only true for non-arch/df, else mirrors isCompleted", () => {
        const arch = makeCanvas({ canvas_type: CanvasType.architecture });
        const df = makeCanvas({ canvas_type: CanvasType.data_flow });
        const ts = makeCanvas({ canvas_type: CanvasType.threat_scenario });
        const pd = makeDiagram([arch, df, ts], { isCompleted: true });

        updateCanvasViewOnly(pd as any);

        const [a, d, t] = pd.canvas;
        expect(a.view_only).toBe(true);
        expect(d.view_only).toBe(true);
        expect(t.view_only).toBe(true);

        // When not completed
        const pd2 = makeDiagram(
            [
                makeCanvas({ canvas_type: CanvasType.architecture }),
                makeCanvas({ canvas_type: CanvasType.data_flow }),
                makeCanvas({ canvas_type: CanvasType.threat_scenario }),
            ],
            { isCompleted: false }
        );
        updateCanvasViewOnly(pd2 as any);
        expect(pd2.canvas[0].view_only).toBe(false);
        expect(pd2.canvas[1].view_only).toBe(false);
        expect(pd2.canvas[2].view_only).toBe(true);
    });
});
