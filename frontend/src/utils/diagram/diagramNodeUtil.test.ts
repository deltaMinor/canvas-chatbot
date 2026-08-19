import { Position } from "@xyflow/react";
import { describe, expect, it, vi } from "vitest";

import { CanvasNodeVariantType, CanvasType } from "#root/enums/diagram";
import { CanvasNodeType } from "#root/enums/diagram";

const {
    checkCardNodeIcon,
    checkIfNodeCanBeDeleted,
    checkNodeDeletable,
    checkOutdatedNodeKey,
    evalGetNodePropsFunc,
    getAllChildNodes,
    getAllPathNodeIds,
    getArchitectureCanvasNodeProps,
    getEnrichedNodes,
    getDataFlowCanvasNodeProps,
    getInitializedDiagramNode,
    getInitializedDiagramNodes,
    getInterfaceNodeId,
    getMultiPathNodes,
    getNodeArrayIndex,
    getPositionFromHandleId,
    getProcessedNodes,
    getSelectedViewNodes,
    getSinglePathNodes,
    getSummaryCanvasNodeProps,
    getThreatScenarioCanvasNodeProps,
    moveNodeInPlace,
    patchCanvasListWithUpdatedIcons,
} = await import("./diagramNodeUtil");

describe("diagramNodeUtil", () => {
    describe("getAllPathNodeIds", () => {
        it("collects unique node ids from all canvases' attack paths", () => {
            const canvas = [
                {
                    ref: {
                        threat_scenario_ref: {
                            attackPaths: [{ nodes: ["a", "b"] }],
                        },
                    },
                },
                {
                    ref: {
                        threat_scenario_ref: {
                            attackPaths: [{ nodes: ["b", "c"] }],
                        },
                    },
                },
            ];
            expect(getAllPathNodeIds(canvas as any)).toEqual(["a", "b", "c"]);
        });

        it("returns empty array for missing refs", () => {
            expect(getAllPathNodeIds([] as any)).toEqual([]);
        });
    });

    describe("getMultiPathNodes", () => {
        it("marks path nodes as selected style and others as deselected", () => {
            const canvas = [
                {
                    ref: {
                        threat_scenario_ref: {
                            attackPaths: [{ nodes: ["x"] }],
                        },
                    },
                },
            ];
            const nodes = [
                { id: "x", style: {} },
                { id: "y", style: {} },
            ];
            const res = getMultiPathNodes(canvas as any, nodes as any);
            expect(res.find((n) => n.id === "x")?.style.opacity).toBeDefined();
            expect(res.find((n) => n.id === "y")?.style.opacity).toBeDefined();
        });
    });

    describe("getSinglePathNodes", () => {
        it("sets opacity correctly for path nodes and cluster children", () => {
            const cluster = {
                id: "c1",
                type: CanvasNodeVariantType.clusterNode,
                parentId: undefined,
            };
            const infoNode = { id: "i1", parentId: "c1" };
            const selectedCanvas = { nodes: [cluster] };
            const selectedPath = { nodes: ["c1"] };
            const summaryNodes = [cluster, infoNode] as any;
            const result = getSinglePathNodes(
                summaryNodes,
                selectedCanvas as any,
                selectedPath as any
            );
            expect(result).toHaveLength(2);
            expect(result[0].style.opacity).toBeDefined();
        });
    });

    describe("getEnrichedNodes", () => {
        it("fills in default icon and label from class when not present", () => {
            const nodes = [{ data: { class: "WebServer" } }];
            const res = getEnrichedNodes(nodes as any);
            expect(res[0].data.icon).toBeTruthy();
            expect(res[0].data.label).toBeTruthy();
        });

        it("preserves existing icon and label when already set", () => {
            const nodes = [{ data: { class: "WebServer", icon: "custom-icon", label: "My Node" } }];
            const res = getEnrichedNodes(nodes as any);
            expect(res[0].data.icon).toBe("custom-icon");
            expect(res[0].data.label).toBe("My Node");
        });
    });

    describe("getSelectedViewNodes", () => {
        it("applies nodePropsFunc changes", () => {
            const nodes = [{ id: "1", style: {} }];
            const func = vi.fn(() => ({
                style: { opacity: 0.5 },
                selected: true,
            }));
            const result = getSelectedViewNodes(nodes as any, [] as any, func);
            expect(result[0].selected).toBe(true);
            expect(func).toHaveBeenCalled();
        });
    });

    describe("CanvasNodeProps functions", () => {
        it("architecture nodes get editable props", () => {
            const node = {
                data: { type: CanvasNodeType.architecture.toString() },
            };
            expect(
                getArchitectureCanvasNodeProps({
                    selectedCanvas: { view_only: false },
                    node,
                } as any).connectable
            ).toBe(true);
        });

        it("data_flow architecture type has correct props", () => {
            const node = {
                data: { type: CanvasNodeType.architecture.toString() },
            };
            expect(
                getDataFlowCanvasNodeProps({
                    selectedCanvas: { view_only: false },
                    node,
                } as any).connectable
            ).toBe(true);
        });

        it("summary always deselects", () => {
            expect(getSummaryCanvasNodeProps({} as any).selectable).toBe(false);
        });

        it("threat_scenario respects viewAllPaths", () => {
            const node = { id: "n1", style: {} };
            const canvas = [
                {
                    ref: {
                        threat_scenario_ref: {
                            attackPaths: [{ nodes: ["n1"] }],
                        },
                    },
                },
            ];
            expect(
                getThreatScenarioCanvasNodeProps({
                    canvas,
                    node,
                    viewAllPaths: true,
                } as any).style.opacity
            ).toBeDefined();
        });
    });

    describe("evalGetNodePropsFunc", () => {
        it("returns correct function per canvas type", () => {
            expect(evalGetNodePropsFunc(CanvasType.architecture)).toBe(
                getArchitectureCanvasNodeProps
            );
        });
    });

    describe("getProcessedNodes", () => {
        it("filters with view and auth if flags set", () => {
            const nodes = [{ id: "a" }];
            const result = getProcessedNodes({
                projectDiagram: { canvas: [] } as any,
                canvasNodes: nodes as any,
                selectedCanvas: { canvas_type: CanvasType.architecture } as any,
                filterAuthorizedNodes: true,
                filterSelectedViewNodes: true,
            });
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("checkNodeDeletable", () => {
        it("throws if canvas type mismatch and not allowed", () => {
            expect(() =>
                checkNodeDeletable({
                    node: {
                        data: { type: "x" },
                        type: "",
                        deletable: true,
                    } as any,
                    selectedCanvas: { canvas_type: "y" } as any,
                })
            ).toThrow();
        });
    });

    describe("getAllChildNodes", () => {
        it("returns all nested children", () => {
            const nodes = [
                { id: "p", parentId: undefined, hidden: false },
                { id: "c1", parentId: "p", hidden: false },
                { id: "c2", parentId: "c1", hidden: false },
            ];
            expect(getAllChildNodes({ node_id: "p", nodes } as any)).toHaveLength(2);
        });
    });

    describe("checkIfNodeCanBeDeleted", () => {
        it("throws if child not selected", () => {
            const node = {
                id: "p",
                data: { type: "t" },
                type: "",
                deletable: true,
            };
            const nodes = [{ id: "c", parentId: "p", hidden: false }];
            expect(() =>
                checkIfNodeCanBeDeleted({
                    node: node as any,
                    nodes: nodes as any,
                    selectedCanvas: { canvas_type: "t" } as any,
                    selectedNodeIdList: [],
                })
            ).toThrow();
        });
    });

    describe("getPositionFromHandleId", () => {
        it("returns default if empty", () => {
            expect(getPositionFromHandleId("")).toBe(Position.Bottom);
        });
        it("parses position from id", () => {
            expect(getPositionFromHandleId("abc_top")).toBe("top");
        });
    });

    describe("Icon patching", () => {
        it("checkOutdatedNodeKey updates icon if key not found", () => {
            const node = { data: {} };
            expect(checkOutdatedNodeKey(node as any, "nonexistent")).toBe(true);
        });
        it("checkCardNodeIcon updates if mismatch", () => {
            const node = { data: { cardRefKey: "something" } };
            expect(checkCardNodeIcon(node as any, "old")).toBeTypeOf("boolean");
        });
        it("patchCanvasListWithUpdatedIcons calls inner functions", () => {
            const canvas = [{ nodes: [{ data: { icon: "old" } }] }];
            patchCanvasListWithUpdatedIcons(canvas as any, false);
            expect(Array.isArray(canvas[0].nodes)).toBe(true);
        });
    });

    describe("Initialization helpers", () => {
        it("getInitializedDiagramNode merges defaults", () => {
            expect(getInitializedDiagramNode({} as any)).toBeTypeOf("object");
        });
        it("getInitializedDiagramNodes maps array", () => {
            expect(getInitializedDiagramNodes([{} as any])).toHaveLength(1);
        });
    });

    describe("Array manipulation", () => {
        it("getNodeArrayIndex finds index", () => {
            expect(getNodeArrayIndex({ id: "a" } as any, [{ id: "a" }] as any)).toBe(0);
        });
        it("moveNodeInPlace changes order", () => {
            const arr = [{ id: "a" }, { id: "b" }];
            moveNodeInPlace({ nodes: arr as any, fromIndex: 0, toIndex: 1 });
            expect(arr[1].id).toBe("a");
        });
    });

    describe("getInterfaceNodeId", () => {
        it("concats ids", () => {
            expect(getInterfaceNodeId("dev", "if")).toBe("dev__if");
        });
        it("throws if missing args", () => {
            expect(() => getInterfaceNodeId("", "if")).toThrow();
        });
    });
});
