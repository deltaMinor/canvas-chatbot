import secureLocalStorage from "react-secure-storage";

import { Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-secure-storage", () => ({
    default: { removeItem: vi.fn() },
}));

const {
    appendToUserLocalStorage,
    clearLoginTokens,
    clearSessionVar,
    getFromUserLocalStorage,
    getFromProjectCanvasLocalStorage,
    appendToProjectCanvasLocalStorage,
} = await import("./localStorage");

// 3) Reset state/mocks per test
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    (secureLocalStorage.removeItem as unknown as Mock).mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("appendToUserLocalStorage", () => {
    it("appends/merges value under user_id key when user_id is present", () => {
        // seed token_state with a user_id
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "user-1" }));
        // also pre-existing user object
        localStorage.setItem("user-1", JSON.stringify({ existing: 1 }));

        appendToUserLocalStorage("theme", "dark");

        const stored = JSON.parse(localStorage.getItem("user-1") || "{}");
        expect(stored).toEqual({ existing: 1, theme: "dark" });

        // can append another key
        appendToUserLocalStorage("lang", "en");
        const stored2 = JSON.parse(localStorage.getItem("user-1") || "{}");
        expect(stored2).toEqual({ existing: 1, theme: "dark", lang: "en" });
    });

    it("does nothing when user_id is empty string", () => {
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "" }));
        appendToUserLocalStorage("k", "v");

        // No key named '' should be created; token_state is still present
        expect(localStorage.getItem("")).toBeNull();
    });

    it("creates a new user object if none exists", () => {
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "u2" }));
        expect(localStorage.getItem("u2")).toBeNull();

        appendToUserLocalStorage("first", 123);
        const obj = JSON.parse(localStorage.getItem("u2") || "{}");
        expect(obj).toEqual({ first: 123 });
    });
});

describe("getFromUserLocalStorage", () => {
    it("returns stringified value from user-local storage", () => {
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "me" }));
        localStorage.setItem("me", JSON.stringify({ a: 1, b: "bee" }));

        expect(getFromUserLocalStorage("a")).toBe("1"); // number -> "1"
        expect(getFromUserLocalStorage("b")).toBe("bee"); // string -> "bee"
        expect(getFromUserLocalStorage("missing")).toBe("undefined");
    });

    it("returns empty string if user_id is empty", () => {
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "" }));
        expect(getFromUserLocalStorage("x")).toBe("");
    });

    it('returns "undefined" if user dict not present', () => {
        localStorage.setItem("access_token_state", JSON.stringify({ user_id: "nope" }));
        // there's no 'nope' entry yet
        expect(getFromUserLocalStorage("k")).toBe("undefined");
    });
});

describe("appendToProjectLocalStorage", () => {
    it("creates and merges canvas-specific object under project id", () => {
        const project_id = "project_123";
        const canvas_id = "canvasA";

        // Start empty
        expect(localStorage.getItem(project_id)).toBeNull();

        appendToProjectCanvasLocalStorage(project_id, canvas_id, "zoom", 1.25);
        let stored = JSON.parse(localStorage.getItem(project_id) || "{}");
        expect(stored).toEqual({ canvases: { [canvas_id]: { zoom: 1.25 } } });

        // Merge another key under same canvas
        appendToProjectCanvasLocalStorage(project_id, canvas_id, "layout", "grid");
        stored = JSON.parse(localStorage.getItem(project_id) || "{}");
        expect(stored).toEqual({ canvases: { [canvas_id]: { zoom: 1.25, layout: "grid" } } });

        // Different canvas_id merges independently
        appendToProjectCanvasLocalStorage(project_id, "canvasB", "layout", "free");
        stored = JSON.parse(localStorage.getItem(project_id) || "{}");
        expect(stored).toEqual({
            canvases: {
                [canvas_id]: { zoom: 1.25, layout: "grid" },
                canvasB: { layout: "free" },
            },
        });
    });

    it("no-ops if project_id is empty string", () => {
        appendToProjectCanvasLocalStorage("", "c", "k", "v");
        // No key named '' should be set
        expect(localStorage.getItem("")).toBeNull();
    });
});

describe("getFromProjectLocalStorage", () => {
    it("retrieves typed value for project/canvas key", () => {
        const project_id = "project_abc";
        const canvas_id = "c1";
        localStorage.setItem(
            project_id,
            JSON.stringify({ canvases: { [canvas_id]: { foo: { bar: 2 } } } })
        );

        type T = { bar: number };
        const val = getFromProjectCanvasLocalStorage<T>(project_id, canvas_id, "foo");
        expect(val).toEqual({ bar: 2 });
    });

    it("returns undefined for empty project_id or missing key", () => {
        expect(getFromProjectCanvasLocalStorage("" as any, "c", "k")).toBeUndefined();

        const project_id = "project_x";
        localStorage.setItem(project_id, JSON.stringify({ canvases: { c2: { a: 1 } } }));
        expect(getFromProjectCanvasLocalStorage(project_id, "c2", "missing")).toBeUndefined();
        expect(getFromProjectCanvasLocalStorage("project_y", "c2", "a")).toBeUndefined();
    });
});

describe("clearLoginTokens", () => {
    it("removes token keys, secure storage keys, and project_* keys", () => {
        // Seed localStorage
        localStorage.setItem("access_token", "t");
        localStorage.setItem("access_token_refresh", "rt");
        localStorage.setItem("access_token_state", "state");
        localStorage.setItem("token_storage", "storage");
        localStorage.setItem("token_type", "jwt");

        localStorage.setItem("project_1", "p1");
        localStorage.setItem("project_2", "p2");
        localStorage.setItem("not_project_key", "keep");

        clearLoginTokens();

        // token keys removed
        expect(localStorage.getItem("access_token")).toBeNull();
        expect(localStorage.getItem("access_token_refresh")).toBeNull();
        expect(localStorage.getItem("access_token_state")).toBeNull();
        expect(localStorage.getItem("token_storage")).toBeNull();
        expect(localStorage.getItem("token_type")).toBeNull();

        // project_* removed
        expect(localStorage.getItem("project_1")).toBeNull();
        expect(localStorage.getItem("project_2")).toBeNull();

        // non-matching keys retained
        expect(localStorage.getItem("not_project_key")).toBe("keep");

        // secureLocalStorage calls
        const removeItemMock = secureLocalStorage.removeItem as unknown as Mock;
        expect(removeItemMock).toHaveBeenCalledWith("secretkey");
        expect(removeItemMock).toHaveBeenCalledWith("csrftoken");
        expect(removeItemMock).toHaveBeenCalledWith("authorization");
    });
});

describe("clearSessionVar", () => {
    it("removes specified keys from the user_id session blob", () => {
        const user_id = "user-99";
        const state = { a: 1, b: 2, c: 3 };
        sessionStorage.setItem(user_id, JSON.stringify(state));

        clearSessionVar(user_id, ["b", "missing"]);
        const updated = JSON.parse(sessionStorage.getItem(user_id) || "{}");
        expect(updated).toEqual({ a: 1, c: 3 });
    });

    it("no-ops for falsy user_id", () => {
        sessionStorage.setItem("x", JSON.stringify({ k: 1 }));
        clearSessionVar("", ["k"]);
        // original value untouched
        expect(sessionStorage.getItem("x")).toBe(JSON.stringify({ k: 1 }));
    });

    it("handles non-existent session values gracefully", () => {
        clearSessionVar("does-not-exist", ["a"]);
        // nothing thrown; key created/updated to {} because code sets after reduce?
        // The code only sets for a defined user_id, and uses "{}" fallback, then sets back "{}".
        expect(sessionStorage.getItem("does-not-exist")).toBe("{}");
    });
});
