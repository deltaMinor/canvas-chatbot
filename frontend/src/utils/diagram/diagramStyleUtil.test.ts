import { describe, expect, it } from "vitest";

import { CanvasEdgeColor } from "#root/constants/diagram";
import { DiagramComponentType } from "#root/interfaces/diagram";

const { getBackgroundColor } = await import("./diagramStyleUtil");

describe("getBackgroundColor", () => {
    it.each([
        [
            "architecture -> CanvasEdgeColor.architecture",
            DiagramComponentType.architecture.toString(),
            CanvasEdgeColor.architecture,
        ],
        [
            "data_flow -> CanvasEdgeColor.data_flow",
            DiagramComponentType.data_flow.toString(),
            CanvasEdgeColor.data_flow,
        ],
        [
            "custom -> CanvasEdgeColor.threat_scenario",
            DiagramComponentType.custom.toString(),
            CanvasEdgeColor.threat_scenario,
        ],
    ])("returns correct color for %s", (_label, type, expected) => {
        expect(getBackgroundColor({ type })).toBe(expected);
    });

    it("falls back to #000 for unknown type", () => {
        expect(getBackgroundColor({ type: "totally-unknown" })).toBe("#000");
    });
});
