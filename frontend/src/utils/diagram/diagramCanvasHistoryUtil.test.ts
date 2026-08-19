import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- Mocks
vi.mock("#root/constants/diagram", () => ({
    MAX_CANVAS_DATA_HISTORY_ITEMS: 3, // set a small cap to make trimming easy to test
}));

const appendToProjectCanvasLocalStorage = vi.fn();
const getFromProjectCanvasLocalStorage = vi.fn();
const setDiagramCanvasHistory = vi.fn();
const setDiagramCanvasHistoryIndex = vi.fn();
vi.mock("./localStorage", () => ({
    appendToProjectCanvasLocalStorage,
    getFromProjectCanvasLocalStorage,
}));

vi.mock("#root/stores/projectDiagram/canvasHistory", () => ({
    setDiagramCanvasHistory,
    setDiagramCanvasHistoryIndex,
}));

// ---- Import SUT after mocks
const {
    appendCanvasHistory,
    getCanvasHistory,
    getCanvasHistoryIndex,
    updateCanvasHistory,
    updateCanvasHistoryIndex,
} = await import("./diagramCanvasHistoryUtil");

// ---- Helpers
type AnyCanvas = { canvas_id: string; [k: string]: any };
const makeCanvas = (id: string, n: number): AnyCanvas => ({
    canvas_id: id,
    rev: n,
});

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("updateCanvasHistory", () => {
    it("sets state and persists history", () => {
        const list = [makeCanvas("c-1", 1), makeCanvas("c-1", 2)];

        updateCanvasHistory({
            instanceId: "instance-1",
            canvas_id: "c-1",
            canvas: list as any,
        });

        expect(setDiagramCanvasHistory).toHaveBeenCalledWith(list, "instance-1");
        expect(appendToProjectCanvasLocalStorage).toHaveBeenCalledWith(
            "proj-1",
            "c-1",
            "history",
            list
        );
    });
});

describe("updateCanvasHistoryIndex", () => {
    it("sets index and persists historyIndex", () => {
        updateCanvasHistoryIndex({
            instanceId: "instance-2",
            canvas_id: "c-9",
            index: 7,
        });

        expect(setDiagramCanvasHistoryIndex).toHaveBeenCalledWith(7, "instance-2");
        expect(appendToProjectCanvasLocalStorage).toHaveBeenCalledWith(
            "proj-1",
            "c-9",
            "historyIndex",
            7
        );
    });
});

describe("getCanvasHistory", () => {
    it("returns both history and index when present", () => {
        // 1st call -> history, 2nd call -> index
        getFromProjectCanvasLocalStorage
            .mockImplementationOnce(() => [makeCanvas("c-1", 1)])
            .mockImplementationOnce(() => 3);

        const out = getCanvasHistory("p-1", "c-1");
        expect(out.canvas_data_history).toEqual([makeCanvas("c-1", 1)]);
        expect(out.canvas_data_history_index).toBe(3);
    });

    it("defaults index to 0 when missing", () => {
        getFromProjectCanvasLocalStorage
            .mockImplementationOnce(() => [makeCanvas("c-1", 1)])
            .mockImplementationOnce(() => undefined);

        const out = getCanvasHistory("p-1", "c-1");
        expect(out.canvas_data_history_index).toBe(0);
    });
});

describe("getCanvasHistoryIndex", () => {
    it("returns stored index", () => {
        getFromProjectCanvasLocalStorage.mockImplementationOnce(() => 5);
        expect(getCanvasHistoryIndex("p", "c")).toBe(5);
    });

    it("returns 0 when missing", () => {
        getFromProjectCanvasLocalStorage.mockImplementationOnce(() => undefined);
        expect(getCanvasHistoryIndex("p", "c")).toBe(0);
    });
});

describe("appendCanvasHistory", () => {
    it("overrides forward history when index is not at the end (diff > 0)", () => {
        const canvases = [makeCanvas("c-1", 1), makeCanvas("c-1", 2), makeCanvas("c-1", 3)];
        const idx = 1; // current index points to rev=2, forward item (rev=3) should be dropped
        const next = makeCanvas("c-1", 4);

        // getCanvasHistory -> [history, index?]
        getFromProjectCanvasLocalStorage
            .mockImplementationOnce(() => canvases) // history
            .mockImplementationOnce(() => idx) // historyIndex for getCanvasHistory
            .mockImplementationOnce(() => idx); // historyIndex for getCanvasHistoryIndex

        appendCanvasHistory({
            instanceId: "instance-1",
            project_id: "proj-x",
            selectedCanvas: next as any,
        });

        // Expect slice to index+1 (drop forward entries), then push next
        const expected = [makeCanvas("c-1", 1), makeCanvas("c-1", 2), next];

        expect(setDiagramCanvasHistory).toHaveBeenCalledWith(expected, "instance-1");

        // updateCanvasHistoryIndex gets called with last index of new array
        expect(setDiagramCanvasHistoryIndex).toHaveBeenCalledWith(
            expected.length - 1,
            "instance-1"
        );

        // Persistence from both update calls
        expect(appendToProjectCanvasLocalStorage).toHaveBeenNthCalledWith(
            1,
            "proj-x",
            "c-1",
            "history",
            expected
        );
        expect(appendToProjectCanvasLocalStorage).toHaveBeenNthCalledWith(
            2,
            "proj-x",
            "c-1",
            "historyIndex",
            expected.length - 1
        );
    });

    it("keeps only last MAX items when already at the end (diff <= 0) before pushing", () => {
        // MAX = 3 (from our mock). Start with 4 history entries, index at end => diff = 0.
        const canvases = [
            makeCanvas("c-2", 1),
            makeCanvas("c-2", 2),
            makeCanvas("c-2", 3),
            makeCanvas("c-2", 4),
        ];
        const idx = canvases.length - 1; // at end
        const next = makeCanvas("c-2", 5);

        getFromProjectCanvasLocalStorage
            .mockImplementationOnce(() => canvases) // history
            .mockImplementationOnce(() => idx) // historyIndex for getCanvasHistory
            .mockImplementationOnce(() => idx); // historyIndex for getCanvasHistoryIndex

        appendCanvasHistory({
            instanceId: "instance-1",
            project_id: "proj-y",
            selectedCanvas: next as any,
        });

        // When diff <= 0, code trims to last MAX (3) THEN pushes next -> length becomes 4
        const expectedTrimmedThenPushed = [
            makeCanvas("c-2", 2),
            makeCanvas("c-2", 3),
            makeCanvas("c-2", 4),
            next,
        ];

        expect(setDiagramCanvasHistory).toHaveBeenCalledWith(
            expectedTrimmedThenPushed,
            "instance-1"
        );

        expect(setDiagramCanvasHistoryIndex).toHaveBeenCalledWith(
            expectedTrimmedThenPushed.length - 1,
            "instance-1"
        );

        expect(appendToProjectCanvasLocalStorage).toHaveBeenNthCalledWith(
            1,
            "proj-y",
            "c-2",
            "history",
            expectedTrimmedThenPushed
        );
        expect(appendToProjectCanvasLocalStorage).toHaveBeenNthCalledWith(
            2,
            "proj-y",
            "c-2",
            "historyIndex",
            expectedTrimmedThenPushed.length - 1
        );
    });

    it("handles empty history gracefully", () => {
        getFromProjectCanvasLocalStorage
            .mockImplementationOnce(() => undefined) // history missing
            .mockImplementationOnce(() => undefined) // index (unused)
            .mockImplementationOnce(() => 0); // for getCanvasHistoryIndex

        // The function should not throw since getCanvasHistory provides fallback empty array
        expect(() =>
            appendCanvasHistory({
                instanceId: "instance-1",
                project_id: "proj-z",
                selectedCanvas: makeCanvas("c-3", 1) as any,
            })
        ).not.toThrow();
    });
});
