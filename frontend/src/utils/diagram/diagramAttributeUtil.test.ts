import { describe, expect, it } from "vitest";

import { DEFAULT_ICON_NODE_HEIGHT, DEFAULT_ICON_NODE_WIDTH } from "../constants/diagram";
import { SelectableValue } from "../interfaces";
import { CanvasNodeVariantType, UserStoryCardRefEnum } from "../interfaces/diagram";
import { BaseFieldAttribute } from "../interfaces/diagramAttributes";

import {
    generateDiagramElementDetails,
    generateDiagramMainElementDetails,
    generateValidation,
    generateValidationForMinMax,
    getArrangedAttributes,
    getAttributeOptions,
    getAvailableAttributeOptions,
    getDataStoredOptions,
    getDefaultAttributeValue,
} from "./diagramAttributeUtil";

/* ----------------------- helpers ----------------------- */

const makeNode = (overrides: Partial<DiagramNode> & { id: string; type: any }): DiagramNode => ({
    id: overrides.id,
    type: overrides.type,
    position: { x: 0, y: 0 },
    data: {},
    ...(overrides as any),
});

const makeAttr = (
    label: string,
    type: BaseFieldAttribute["type"],
    extra?: Partial<BaseFieldAttribute>
): BaseFieldAttribute => ({
    key: extra?.key ?? `${type}:${label}`,
    label,
    type,
    disabled: extra?.disabled ?? false,
    deletable: extra?.deletable ?? true,
    options: extra?.options ?? [],
    validation: extra?.validation,
});

/* ----------------------- generateValidation ----------------------- */

describe("generateValidation", () => {
    it("returns a function for any attribute type", () => {
        for (const t of ["text", "number", "checkbox", "unknown"]) {
            expect(typeof generateValidation(t)).toBe("function");
        }
    });

    it("validates text/number/checkbox as expected", () => {
        const vText = generateValidation("text");
        expect(vText("hello")).toBe(true);
        expect(vText(123 as unknown)).toBe(false);

        const vNum = generateValidation("number");
        expect(vNum(0)).toBe(true);
        expect(vNum("1" as unknown)).toBe(false);

        const vChk = generateValidation("checkbox");
        expect(vChk(true)).toBe(true);
        expect(vChk("yes")).toBe(true);
        expect(vChk(0)).toBe(false);

        const vDefault = generateValidation("anything");
        expect(vDefault({})).toBe(true);
    });
});

/* ----------------------- generateValidationForMinMax ----------------------- */

describe("generateValidationForMinMax", () => {
    it("enforces min and max for width/height when max provided", () => {
        const vW = generateValidationForMinMax("width", 10, 100);
        expect(vW(9)).toBe(false);
        expect(vW(10)).toBe(true);
        expect(vW(100)).toBe(true);
        expect(vW(101)).toBe(false);

        const vH = generateValidationForMinMax("height", 5, 6);
        expect(vH(4)).toBe(false);
        expect(vH(5)).toBe(true);
        expect(vH(6)).toBe(true);
        expect(vH(7)).toBe(false);
    });

    it("enforces only min when max omitted", () => {
        const v = generateValidationForMinMax("width", 3);
        expect(v(2)).toBe(false);
        expect(v(3)).toBe(true);
        expect(v(1000)).toBe(true);
    });

    it("returns permissive validator for unhandled keys", () => {
        const v = generateValidationForMinMax("other", 0, 1);
        expect(v(-999)).toBe(true);
    });
});

/* ----------------------- generateDiagramElementDetails ----------------------- */

describe("generateDiagramElementDetails", () => {
    it("filters keys and wires min/max validation for width/height", () => {
        const data = {
            width: 50,
            height: 40,
            minWidth: 10,
            maxWidth: 100,
            minHeight: 20,
            maxHeight: 200,
            title: "box",
            done: false,
        };
        const raw: BaseFieldAttribute[] = [
            { key: "width", label: "W", type: "number", disabled: false, deletable: true },
            { key: "height", label: "Height", type: "number", disabled: false, deletable: true },
            { key: "title", label: "Title", type: "text", disabled: false, deletable: true },
            { key: "done", label: "Done", type: "checkbox", disabled: false, deletable: true },
            { key: "ignored", label: "Ignored", type: "text", disabled: false, deletable: true },
        ];

        const list = generateDiagramElementDetails(data as Record<string, unknown>, raw, true);

        const keys = list.map((a) => a.key);
        expect(keys).toEqual(expect.arrayContaining(["width", "height", "title", "done"]));
        expect(keys).not.toContain("ignored");

        const width = list.find((a) => a.key === "width")!;
        expect(width.validation!(9)).toBe(false);
        expect(width.validation!(10)).toBe(true);
        expect(width.validation!(101)).toBe(false);

        const height = list.find((a) => a.key === "height")!;
        expect(height.validation!(19)).toBe(false);
        expect(height.validation!(20)).toBe(true);
        expect(height.validation!(201)).toBe(false);
    });

    it("defaults min to DEFAULT_ICON_ sizes when min* missing", () => {
        const data = {
            width: 5,
            height: 5,
            title: "x",
        } as Record<string, unknown>;

        const raw: BaseFieldAttribute[] = [
            { key: "width", label: "Width", type: "number", disabled: false, deletable: true },
            { key: "height", label: "Height", type: "number", disabled: false, deletable: true },
        ];

        const list = generateDiagramElementDetails(data, raw, true);

        const w = list.find((a) => a.key === "width")!;
        const h = list.find((a) => a.key === "height")!;
        expect(w.validation!(DEFAULT_ICON_NODE_WIDTH - 1)).toBe(false);
        expect(h.validation!(DEFAULT_ICON_NODE_HEIGHT - 1)).toBe(false);
    });

    it("forces disabled when editable=false", () => {
        const data = { title: "x" } as Record<string, unknown>;
        const raw: BaseFieldAttribute[] = [
            { key: "title", label: "Title", type: "text", disabled: false, deletable: true },
        ];
        const list = generateDiagramElementDetails(data, raw, false);
        expect(list[0].disabled).toBe(true);
    });
});

/* ----------------------- generateDiagramMainElementDetails ----------------------- */

describe("generateDiagramMainElementDetails", () => {
    it("filters attributes, applies disabled, validation, and select options", () => {
        const node: DiagramNode = {
            id: "n1",
            type: CanvasNodeVariantType.clusterNode,
            position: { x: 0, y: 0 },
            data: { icon: "x" },
            ariaLabel: "My label",
            parentId: "",
            deletable: false,
        };

        const allNodes: DiagramNode[] = [
            makeNode({ id: "c1", type: CanvasNodeVariantType.clusterNode }),
            makeNode({ id: "i1", type: CanvasNodeVariantType.infoNode }),
        ];

        const raw: BaseFieldAttribute[] = [
            {
                key: "ariaLabel",
                label: "Aria Label",
                type: "text",
                validation: () => true,
                options: [] as SelectableValue[],
                deletable: true,
                disabled: false,
            },
            {
                key: "parentId",
                label: "Parent",
                type: "select",
                validation: () => true,
                options: [] as SelectableValue[],
                deletable: true,
                disabled: false,
            },
            {
                key: "deletable",
                label: "Deletable",
                type: "checkbox",
                validation: () => true,
                options: [] as SelectableValue[],
                deletable: true,
                disabled: false,
            },
        ];

        const list = generateDiagramMainElementDetails(node, raw, true, allNodes);
        const keys = list.map((a) => a.key);
        expect(keys).toEqual(expect.arrayContaining(["ariaLabel", "parentId", "deletable"]));

        const parent = list.find((a) => a.key === "parentId")!;
        expect(parent.options).toEqual([{ label: "c1", value: "c1" }]);
        expect(typeof list.find((a) => a.key === "ariaLabel")!.validation).toBe("function");
    });

    it("marks attributes disabled when editable=false", () => {
        const node: DiagramNode = makeNode({
            id: "x",
            type: "t",
            ariaLabel: "",
        });
        const raw: BaseFieldAttribute[] = [
            {
                key: "ariaLabel",
                label: "Aria Label",
                type: "text",
                validation: () => true,
                options: [] as SelectableValue[],
                deletable: true,
                disabled: false,
            },
        ];
        const list = generateDiagramMainElementDetails(node, raw, false, []);
        expect(list[0].disabled).toBe(true);
    });
});

/* ----------------------- getDataStoredOptions ----------------------- */

describe("getDataStoredOptions", () => {
    it("maps card_data nodes to SelectableValue", () => {
        const cards: CardNode[] = [
            {
                ref_key: UserStoryCardRefEnum.card_data,
                label: "Name",
                value: "name",
                node_id: "node-1",
                card_id_affliations: [],
            },
            {
                ref_key: "other" as any,
                label: "Ignore",
                value: "ignore",
                node_id: "node-2",
                card_id_affliations: [],
            },
        ];
        const opts = getDataStoredOptions(cards);
        expect(opts).toEqual([{ label: "Name", value: "name" }]);
    });
});

/* ----------------------- getAttributeOptions ----------------------- */

describe("getAttributeOptions", () => {
    it("returns 4 positions for targetPosition/sourcePosition", () => {
        for (const key of ["targetPosition", "sourcePosition"] as const) {
            expect(getAttributeOptions(key, [])).toEqual([
                { label: "left", value: "left" },
                { label: "top", value: "top" },
                { label: "right", value: "right" },
                { label: "bottom", value: "bottom" },
            ]);
        }
    });

    it("maps cluster nodes to parentId options", () => {
        const nodes: DiagramNode[] = [
            makeNode({ id: "A", type: CanvasNodeVariantType.clusterNode }),
            makeNode({ id: "B", type: "regularNode" }),
            makeNode({ id: "C", type: CanvasNodeVariantType.clusterNode }),
        ];
        expect(getAttributeOptions("parentId", nodes)).toEqual([
            { label: "A", value: "A" },
            { label: "C", value: "C" },
        ]);
    });

    it("returns empty array for unknown keys", () => {
        expect(getAttributeOptions("unknown", [])).toEqual([]);
    });
});

/* ----------------------- getArrangedAttributes ----------------------- */

describe("getArrangedAttributes", () => {
    it("sorts non-checkbox first (A→Z, case-insensitive), then checkbox (A→Z)", () => {
        const attrs: BaseFieldAttribute[] = [
            makeAttr("zeta", "text"),
            makeAttr("Alpha", "number"),
            makeAttr("beta", "checkbox"),
            makeAttr("delta", "checkbox"),
            makeAttr("gamma", "text"),
            makeAttr("epsilon", "checkbox"),
        ];
        const arranged = getArrangedAttributes(
            attrs,
            attrs.map((k) => k.key)
        );
        expect(arranged.map((a) => `${a.type}:${a.label}`)).toEqual([
            "number:Alpha",
            "text:gamma",
            "text:zeta",
            "checkbox:beta",
            "checkbox:delta",
            "checkbox:epsilon",
        ]);
    });

    it("is stable for equal labels within groups", () => {
        const attrs: BaseFieldAttribute[] = [
            makeAttr("same", "text", { key: "t1" }),
            makeAttr("same", "text", { key: "t2" }),
            makeAttr("same", "checkbox", { key: "c1" }),
            makeAttr("same", "checkbox", { key: "c2" }),
        ];
        const arranged = getArrangedAttributes(
            attrs,
            attrs.map((k) => k.key)
        );
        expect(arranged.map((a) => a.key)).toEqual(["t1", "t2", "c1", "c2"]);
    });
});

/* ----------------------- getDefaultAttributeValue ----------------------- */

describe("getDefaultAttributeValue", () => {
    it("returns sensible defaults per type", () => {
        expect(getDefaultAttributeValue("select")).toBe("");
        expect(getDefaultAttributeValue("selectmultiple")).toEqual([]);
        expect(getDefaultAttributeValue("number")).toBe(0);
        expect(getDefaultAttributeValue("text")).toBe("");
    });

    it("falls back to empty string for unknown", () => {
        expect(getDefaultAttributeValue("unknown" as any)).toBe("");
    });

    it("returns empty string for undefined type", () => {
        expect(getDefaultAttributeValue(undefined)).toBe("");
    });
});

/* ----------------------- getAvailableAttributeOptions ----------------------- */

describe("getAvailableAttributeOptions", () => {
    it("filters out attributes that already exist in data", () => {
        const attributes: BaseFieldAttribute[] = [
            makeAttr("existing", "text", { key: "existing", deletable: true }),
            makeAttr("new", "text", { key: "new", deletable: true }),
            makeAttr("another", "number", { key: "another", deletable: true }),
        ];
        const existingData = { existing: "value" };

        const options = getAvailableAttributeOptions(attributes, existingData);

        expect(options).toEqual([
            { label: "new", value: "new" },
            { label: "another", value: "another" },
        ]);
        expect(options).not.toContainEqual({ label: "existing", value: "existing" });
    });

    it("filters out attributes that are not deletable", () => {
        const attributes: BaseFieldAttribute[] = [
            makeAttr("deletable", "text", { key: "deletable", deletable: true }),
            makeAttr("notDeletable", "text", { key: "notDeletable", deletable: false }),
            makeAttr("another", "number", { key: "another", deletable: true }),
        ];
        const existingData = {};

        const options = getAvailableAttributeOptions(attributes, existingData);

        expect(options).toEqual([
            { label: "deletable", value: "deletable" },
            { label: "another", value: "another" },
        ]);
        expect(options).not.toContainEqual({ label: "notDeletable", value: "notDeletable" });
    });

    it("returns empty array when all attributes exist or are not deletable", () => {
        const attributes: BaseFieldAttribute[] = [
            makeAttr("existing", "text", { key: "existing", deletable: true }),
            makeAttr("notDeletable", "text", { key: "notDeletable", deletable: false }),
        ];
        const existingData = { existing: "value" };

        const options = getAvailableAttributeOptions(attributes, existingData);

        expect(options).toEqual([]);
    });

    it("handles empty attributes array", () => {
        const attributes: BaseFieldAttribute[] = [];
        const existingData = {};

        const options = getAvailableAttributeOptions(attributes, existingData);

        expect(options).toEqual([]);
    });

    it("handles empty existingData", () => {
        const attributes: BaseFieldAttribute[] = [
            makeAttr("attr1", "text", { key: "attr1", deletable: true }),
            makeAttr("attr2", "number", { key: "attr2", deletable: true }),
        ];
        const existingData = {};

        const options = getAvailableAttributeOptions(attributes, existingData);

        expect(options).toEqual([
            { label: "attr1", value: "attr1" },
            { label: "attr2", value: "attr2" },
        ]);
    });

    it("handles null/undefined existingData", () => {
        const attributes: BaseFieldAttribute[] = [
            makeAttr("attr1", "text", { key: "attr1", deletable: true }),
        ];

        const options1 = getAvailableAttributeOptions(attributes, null as any);
        const options2 = getAvailableAttributeOptions(attributes, undefined as any);

        expect(options1).toEqual([{ label: "attr1", value: "attr1" }]);
        expect(options2).toEqual([{ label: "attr1", value: "attr1" }]);
    });
});
