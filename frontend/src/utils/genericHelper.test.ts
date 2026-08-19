import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SelectableValue } from "#root/interfaces";

import {
    convertCamelToTitleCase,
    convertTimezoneToSGT,
    convertTitleToCamelCase,
    getObjectDifference,
    getStringArrayFromSelected,
    reformatPathString,
    runFunctionAtInterval,
    toTitleCase,
} from "./genericHelper";

describe("runFunctionAtInterval", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("runs repeatedly at interval and stops after maxCounter (on error)", async () => {
        const runThis = vi
            .fn()
            // always return false to trigger error path
            .mockResolvedValue(false);
        const runThisOnError = vi.fn().mockResolvedValue(undefined);
        const counter = { current: 0 };
        const interval = 100;
        const maxCounter = 2;

        runFunctionAtInterval(
            runThis,
            runThisOnError,
            counter as React.RefObject<number>,
            interval,
            maxCounter
        );

        // Kick first timer
        await vi.advanceTimersByTimeAsync(interval);
        // 1st call finished (counter becomes 1), next scheduled
        expect(runThis).toHaveBeenCalledTimes(1);
        expect(runThisOnError).toHaveBeenCalledTimes(1);
        expect(counter.current).toBe(1);

        // 2nd call
        await vi.advanceTimersByTimeAsync(interval);
        expect(runThis).toHaveBeenCalledTimes(2);
        expect(runThisOnError).toHaveBeenCalledTimes(2);
        expect(counter.current).toBe(2);

        // 3rd call happens, then stops (counter becomes 3, > maxCounter)
        await vi.advanceTimersByTimeAsync(interval);
        expect(runThis).toHaveBeenCalledTimes(3);
        expect(runThisOnError).toHaveBeenCalledTimes(3);
        expect(counter.current).toBe(3);

        // No further calls
        await vi.advanceTimersByTimeAsync(interval * 5);
        expect(runThis).toHaveBeenCalledTimes(3);
    });

    it("does not increment counter when runThis returns true", async () => {
        const runThis = vi.fn().mockResolvedValue(true);
        const runThisOnError = vi.fn().mockResolvedValue(undefined);
        const counter = { current: 0 };
        const interval = 50;

        runFunctionAtInterval(
            runThis,
            runThisOnError,
            counter as React.RefObject<number>,
            interval,
            1
        );

        await vi.advanceTimersByTimeAsync(interval);
        expect(runThis).toHaveBeenCalledTimes(1);
        expect(runThisOnError).not.toHaveBeenCalled();
        expect(counter.current).toBe(0);
    });
});

describe("getStringArrayFromSelected", () => {
    it("formats label list with comma+space except for last item", () => {
        const data: SelectableValue[] = [
            { label: "A", value: "a" },
            { label: "B", value: "b" },
            { label: "C", value: "c" },
        ];
        expect(getStringArrayFromSelected(data)).toEqual(["A, ", "B, ", "C "]);
    });

    it("returns empty array for empty input", () => {
        expect(getStringArrayFromSelected([])).toEqual([]);
    });
});

describe("convertCamelToTitleCase", () => {
    it("splits camelCase and capitalizes each word", () => {
        expect(convertCamelToTitleCase("helloWorldAgain")).toBe("Hello World Again");
        expect(convertCamelToTitleCase("one")).toBe("One");
    });
});

describe("reformatPathString", () => {
    it('converts path_# to "Path #"', () => {
        expect(reformatPathString("path_42")).toBe("Path 42");
    });
    it("returns original when not matching pattern", () => {
        expect(reformatPathString("other_value")).toBe("other_value");
    });
});

describe("convertTitleToCamelCase", () => {
    it("converts title to lowerCamelCase", () => {
        expect(convertTitleToCamelCase("Hello World Again")).toBe("helloWorldAgain");
        expect(convertTitleToCamelCase("Single")).toBe("single");
    });
});

describe("toTitleCase", () => {
    it("capitalizes first letter of each word and lowercases the rest", () => {
        expect(toTitleCase("hELLo woRLD")).toBe("Hello World");
    });
    it("returns empty string if input is undefined", () => {
        // @ts-expect-error test runtime behavior
        expect(toTitleCase(undefined)).toBe("");
    });
});

describe("convertTimezoneToSGT", () => {
    it("returns empty string on falsy input", () => {
        expect(convertTimezoneToSGT("")).toBe("");
        // @ts-expect-error test runtime
        expect(convertTimezoneToSGT(undefined)).toBe("");
    });

    it("adds +8h to a UTC ISO without Z and formats correctly", () => {
        expect(convertTimezoneToSGT("2025-01-01T00:00:00")).toBe("2025-01-01 08:00:00 (SGT)");
    });

    it("handles Z-suffixed UTC inputs", () => {
        expect(convertTimezoneToSGT("2025-06-15T13:45:10Z")).toBe("2025-06-15 21:45:10 (SGT)");
    });

    it("rolls over to next day when necessary", () => {
        expect(convertTimezoneToSGT("2025-03-30T20:30:00")).toBe("2025-03-31 04:30:00 (SGT)");
    });
});

describe("getObjectDifference", () => {
    it("returns deep diffs for nested objects", () => {
        const a = {
            same: { deep: 1, also: "x" },
            change: { from: 1, nested: { v: "old" } },
            onlyA: { a: true },
        };
        const b = {
            same: { deep: 1, also: "x" },
            change: { from: 2, nested: { v: "new" } },
            onlyB: { b: true },
        };

        const diff = getObjectDifference(a as any, b as any);
        // "same" omitted
        expect(diff).toHaveProperty("change");
        expect(diff).toHaveProperty("onlyA");

        // nested diffs
        const diffAny = diff as any;
        expect(diffAny.change.from).toEqual({ oldValue: 1, newValue: 2 });
        expect(diffAny.change.nested.v).toEqual({
            oldValue: "old",
            newValue: "new",
        });

        // "onlyA" exists only in obj1
        expect(diff.onlyA).toEqual({
            oldValue: { a: true },
            newValue: undefined,
        });
    });

    it("returns empty object when objects are equal", () => {
        const x = { a: 1, b: { c: "z" } };
        const y = { a: 1, b: { c: "z" } };
        expect(getObjectDifference(x as any, y as any)).toEqual({});
    });
});
