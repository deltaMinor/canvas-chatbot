import { describe, expect, it, vi } from "vitest";

import { ShortUuidIdentifierKey, UuidIdentifierKey } from "#root/interfaces/identifier";

import { generateShortUUID, generateUUID } from "./identifierUtil";

// ---- Mocks for deterministic output ----
vi.mock("uuid", () => ({
    v4: () => "00000000-0000-0000-0000-000000000000",
}));

vi.mock("short-uuid", () => ({
    generate: () => "shrt123",
}));

describe("generateUUID", () => {
    const FIXED = "00000000-0000-0000-0000-000000000000";

    const cases: Array<[UuidIdentifierKey, string]> = [
        [UuidIdentifierKey.assessmentLLM, "assessment_llm_"],
        [UuidIdentifierKey.assessmentSTD, "assessment_standard_"],
        [UuidIdentifierKey.diagramCanvas, "canvas_"],
        [UuidIdentifierKey.diagramEdge, "edge_"],
        [UuidIdentifierKey.diagramImage, "image_"],
        [UuidIdentifierKey.diagramLineSegment, "line_segment_"],
        [UuidIdentifierKey.diagramNode, "node_"],
        [UuidIdentifierKey.dataGridDebounce, "debounce_"],
        [UuidIdentifierKey.project, "project_"],
        [UuidIdentifierKey.resourceTag, "tag_"],
        [UuidIdentifierKey.snackbar, "snackbar_"],
        [UuidIdentifierKey.user, "user_"],
    ];

    it.each(cases)("prefix for %s", (key, prefix) => {
        const val = generateUUID(key);
        expect(val).toBe(`${prefix}${FIXED}`);
    });

    it("returns bare UUID for unknown key", () => {
        const val = generateUUID(999 as unknown as UuidIdentifierKey);
        expect(val).toBe(FIXED);
    });
});

describe("generateShortUUID", () => {
    const FIXED = "shrt123";

    const cases: Array<[ShortUuidIdentifierKey, string]> = [
        [ShortUuidIdentifierKey.diagramWarning, "warning_"],
        [ShortUuidIdentifierKey.formTextSelectable, "text_"],
        [ShortUuidIdentifierKey.formCard, "card_"],
        [ShortUuidIdentifierKey.formOption, "option_"],
        [ShortUuidIdentifierKey.mitigation, "m_"],
        [ShortUuidIdentifierKey.mitigationCustom, "m_custom_"],
        [ShortUuidIdentifierKey.tableRow, "row_"],
    ];

    it.each(cases)("prefix for %s", (key, prefix) => {
        const val = generateShortUUID(key);
        expect(val).toBe(`${prefix}${FIXED}`);
    });

    it("returns bare short id for unknown key", () => {
        const val = generateShortUUID(999 as unknown as ShortUuidIdentifierKey);
        expect(val).toBe(FIXED);
    });
});
