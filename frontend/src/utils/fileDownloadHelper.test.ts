import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadJson, getFileContentFromFile, getFileFromFiles } from "./fileDownloadHelper";

// adjust the import path

describe("downloadJson", () => {
    const originalCreateObjectURL = URL.createObjectURL;

    beforeEach(() => {
        // Mock URL.createObjectURL
        URL.createObjectURL = vi.fn(() => "blob:mock-url");

        // JSDOM anchors need click mocked
        vi.spyOn(document.body, "appendChild");
        vi.spyOn(document.body, "removeChild");
    });

    afterEach(() => {
        vi.restoreAllMocks();
        URL.createObjectURL = originalCreateObjectURL;
    });

    it("creates a JSON blob, attaches a link, triggers a download, and cleans up", () => {
        const data = { foo: "bar", n: 1 };
        const fileName = "my-file";

        // Spy on createElement to inject a clickable anchor we can assert on
        const click = vi.fn();
        const anchor = document.createElement("a");
        anchor.click = click;

        const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(anchor);

        downloadJson(data, fileName);

        // URL.createObjectURL called with a Blob
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe("application/json");

        // Anchor configured correctly
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(anchor.download).toBe(`${fileName}.json`);
        expect(anchor.href).toBe("blob:mock-url");

        // Click triggered and cleanup performed
        expect(click).toHaveBeenCalledTimes(1);
        expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
        expect(document.body.removeChild).toHaveBeenCalledWith(anchor);
    });
});

describe("getFileFromFiles", () => {
    const makeFile = (content: BlobPart, name: string, type = "application/json") =>
        new File([content], name, { type });

    it("throws when no files selected", () => {
        const empty = [] as unknown as FileList; // iterable enough for Array.from
        expect(() => getFileFromFiles(empty)).toThrow("No files selected.");
    });

    it("throws on invalid file type", () => {
        const f = makeFile("{}", "a.txt", "text/plain");
        const list = [f] as unknown as FileList;
        expect(() => getFileFromFiles(list)).toThrow("Invalid file type.");
    });

    it("throws when file exceeds default size limit", () => {
        // default limit = 5MB; make a 5MB+1 file
        const sizeBytes = 5 * 1024 * 1024 + 1;
        const content = new Uint8Array(sizeBytes);
        const f = makeFile(content, "big.json", "application/json");
        const list = [f] as unknown as FileList;
        expect(() => getFileFromFiles(list)).toThrow("File exceeds 5MB.");
    });

    it("respects custom size limit", () => {
        // limit 1MB; file is ~1.1MB
        const sizeBytes = 1.1 * 1024 * 1024;
        const content = new Uint8Array(sizeBytes);
        const f = makeFile(content, "too-big.json");
        const list = [f] as unknown as FileList;
        expect(() => getFileFromFiles(list, 1)).toThrow("File exceeds 1MB.");
    });

    it("returns the file when valid", () => {
        const content = new TextEncoder().encode('{"ok":true}');
        const f = makeFile(content, "ok.json", "application/json");
        const list = [f] as unknown as FileList;
        const result = getFileFromFiles(list);
        expect(result).toBe(f);
    });
});

describe("getFileContentFromFile", () => {
    // Our stubbed FileReader "instance" that tests can control
    let instance: {
        onload: ((ev?: any) => any) | null;
        result: string | ArrayBuffer | null;
        readAsText: (file: File) => void;
    };
    let errSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // silence error logs in rejection tests
        errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        instance = {
            onload: null,
            result: null,
            readAsText: vi.fn(), // we’ll assert calls on this
        };

        // Replace the global FileReader constructor completely
        vi.stubGlobal(
            "FileReader",
            vi.fn(() => instance as any)
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("resolves with parsed JSON object when file contains valid JSON", async () => {
        const file = new File([`{"name":"Ada","n":42}`], "data.json", {
            type: "application/json",
        });

        const p = getFileContentFromFile(file);

        // Simulate the browser finishing the read
        instance.result = `{"name":"Ada","n":42}`;
        instance.onload?.(new ProgressEvent("load"));

        await expect(p).resolves.toEqual({ name: "Ada", n: 42 });
        expect(instance.readAsText).toHaveBeenCalledTimes(1);
        expect(instance.readAsText).toHaveBeenCalledWith(file);
        expect(errSpy).not.toHaveBeenCalled();
    });

    it("rejects with SyntaxError on invalid JSON", async () => {
        const file = new File(["{ oops: }"], "bad.json", {
            type: "application/json",
        });

        const p = getFileContentFromFile(file);

        instance.result = "{ oops: }";
        instance.onload?.(new ProgressEvent("load"));

        await expect(p).rejects.toBeInstanceOf(SyntaxError);
        expect(instance.readAsText).toHaveBeenCalledWith(file);
        expect(errSpy).toHaveBeenCalled(); // logged parse error
    });

    it("rejects with SyntaxError when FileReader.result is not a string", async () => {
        const file = new File(['{"ok":true}'], "weird.json", {
            type: "application/json",
        });

        const p = getFileContentFromFile(file);

        // Simulate a non-string result (e.g., ArrayBuffer/null)
        instance.result = new ArrayBuffer(8);
        instance.onload?.(new ProgressEvent("load"));

        await expect(p).rejects.toBeInstanceOf(SyntaxError);
        expect(instance.readAsText).toHaveBeenCalledWith(file);
        expect(errSpy).toHaveBeenCalled();
    });

    it("resolves null when called with a falsy file", async () => {
        // @ts-expect-error intentionally passing undefined
        await expect(getFileContentFromFile(undefined)).resolves.toBeNull();
        expect(instance.readAsText).not.toHaveBeenCalled();
    });
});
