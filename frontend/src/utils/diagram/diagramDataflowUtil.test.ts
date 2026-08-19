import { describe, expect, it } from "vitest";

import { CardNode, UserStoryCardRef } from "#root/interfaces/diagram";

import { getDeviceToInterfaceMappingFromCanvas } from "./diagramDataflowUtil";

// Helper to create CardNodes quickly
const makeNode = (overrides: Partial<CardNode> = {}): CardNode => ({
    label: overrides.label ?? "label",
    value: overrides.value ?? "value",
    node_id: overrides.node_id ?? "node-1",
    ref_key: overrides.ref_key ?? "ref-1",
    card_id_affliations: overrides.card_id_affliations ?? [],
});

describe("getDeviceToInterfaceMappingFromCanvas", () => {
    it("returns [] when card_ref is null/undefined", () => {
        // If your function signature stays as (card_ref: UserStoryCardRef),
        // cast in tests to exercise this runtime path.
        expect(
            getDeviceToInterfaceMappingFromCanvas(undefined as unknown as UserStoryCardRef)
        ).toEqual([]);
        expect(getDeviceToInterfaceMappingFromCanvas(null as unknown as UserStoryCardRef)).toEqual(
            []
        );
    });

    it("maps each device with interfaces sharing any card_id_affliations", () => {
        const card_ref = {
            card_devices: [
                makeNode({
                    label: "Laptop",
                    value: "dev1",
                    node_id: "n1",
                    card_id_affliations: ["A", "B"],
                }),
                makeNode({
                    label: "Phone",
                    value: "dev2",
                    node_id: "n2",
                    card_id_affliations: ["X"],
                }),
            ],
            card_interface: [
                makeNode({
                    label: "if1",
                    value: "if1",
                    card_id_affliations: ["B", "Z"],
                }), // matches Laptop
                makeNode({
                    label: "if2",
                    value: "if2",
                    card_id_affliations: ["X"],
                }), // matches Phone
                makeNode({
                    label: "if3",
                    value: "if3",
                    card_id_affliations: ["Y"],
                }), // matches none
            ],
        } satisfies Partial<UserStoryCardRef>;

        const out = getDeviceToInterfaceMappingFromCanvas(card_ref as UserStoryCardRef);

        expect(out).toHaveLength(2);

        const laptop = out.find((d) => d.value === "dev1")!;
        const phone = out.find((d) => d.value === "dev2")!;

        expect(laptop.label).toBe("Laptop");
        expect(laptop.node_id).toBe("n1");
        // CardNode doesn't have `id`; use `value` (or `node_id`) to assert
        expect(laptop.interfaces.map((i: CardNode) => i.value)).toEqual(["if1"]);

        expect(phone.label).toBe("Phone");
        expect(phone.node_id).toBe("n2");
        expect(phone.interfaces.map((i: CardNode) => i.value)).toEqual(["if2"]);
    });

    it("returns devices with empty interfaces when there is no overlap", () => {
        const card_ref = {
            card_devices: [
                makeNode({
                    label: "Tablet",
                    value: "dev3",
                    node_id: "n3",
                    card_id_affliations: ["Q"],
                }),
            ],
            card_interface: [
                makeNode({
                    label: "ifA",
                    value: "ifA",
                    card_id_affliations: ["R", "S"],
                }),
            ],
        } satisfies Partial<UserStoryCardRef>;

        const out = getDeviceToInterfaceMappingFromCanvas(card_ref as UserStoryCardRef);
        expect(out).toHaveLength(1);
        expect(out[0].value).toBe("dev3");
        expect(out[0].interfaces).toEqual([]);
    });

    it("handles devices with empty affiliation arrays", () => {
        const card_ref = {
            card_devices: [
                makeNode({
                    label: "Sensor",
                    value: "dev4",
                    node_id: "n4",
                    card_id_affliations: [],
                }),
            ],
            card_interface: [
                makeNode({
                    label: "ifB",
                    value: "ifB",
                    card_id_affliations: ["B"],
                }),
            ],
        } satisfies Partial<UserStoryCardRef>;

        const out = getDeviceToInterfaceMappingFromCanvas(card_ref as UserStoryCardRef);
        expect(out).toHaveLength(1);
        expect(out[0].interfaces).toEqual([]);
    });

    it("handles interfaces missing card_id_affliations (treated like no overlap)", () => {
        // create a valid node then strip the field at runtime
        const ifC = makeNode({
            label: "ifC",
            value: "ifC",
        }) as unknown as Record<string, unknown>;
        delete (ifC as any).card_id_affliations;

        const card_ref = {
            card_devices: [
                makeNode({
                    label: "Gateway",
                    value: "dev5",
                    node_id: "n5",
                    card_id_affliations: ["G"],
                }),
            ],
            // NB: double-cast to bypass structural mismatch complaints
            card_interface: [
                ifC as unknown as CardNode,
                makeNode({
                    label: "ifD",
                    value: "ifD",
                    card_id_affliations: ["G"],
                }),
            ],
        }; // don't use `satisfies` here

        const out = getDeviceToInterfaceMappingFromCanvas(card_ref as UserStoryCardRef);
        const gateway = out[0];
        expect(gateway.interfaces.map((i: CardNode) => i.value)).toEqual(["ifD"]);
    });

    it("returns [] when card_devices is missing or empty", () => {
        const noDevices = {
            card_interface: [
                makeNode({
                    label: "if1",
                    value: "if1",
                    card_id_affliations: ["A"],
                }),
            ],
        } satisfies Partial<UserStoryCardRef>;

        const emptyDevices = {
            card_devices: [],
            card_interface: [
                makeNode({
                    label: "if1",
                    value: "if1",
                    card_id_affliations: ["A"],
                }),
            ],
        } satisfies Partial<UserStoryCardRef>;

        expect(getDeviceToInterfaceMappingFromCanvas(noDevices as UserStoryCardRef)).toEqual([]);
        expect(getDeviceToInterfaceMappingFromCanvas(emptyDevices as UserStoryCardRef)).toEqual([]);
    });

    it("maps with empty interfaces when card_interface is missing or empty", () => {
        const noInterfaces = {
            card_devices: [
                makeNode({
                    label: "Cam",
                    value: "dev6",
                    node_id: "n6",
                    card_id_affliations: ["C"],
                }),
            ],
        } satisfies Partial<UserStoryCardRef>;

        const emptyInterfaces = {
            card_devices: [
                makeNode({
                    label: "Cam",
                    value: "dev6",
                    node_id: "n6",
                    card_id_affliations: ["C"],
                }),
            ],
            card_interface: [],
        } satisfies Partial<UserStoryCardRef>;

        const out1 = getDeviceToInterfaceMappingFromCanvas(noInterfaces as UserStoryCardRef);
        const out2 = getDeviceToInterfaceMappingFromCanvas(emptyInterfaces as UserStoryCardRef);

        expect(out1).toHaveLength(1);
        expect(out1[0].interfaces).toEqual([]);

        expect(out2).toHaveLength(1);
        expect(out2[0].interfaces).toEqual([]);
    });
});
