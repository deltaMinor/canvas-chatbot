export const appendToUserLocalStorage = (
    key: string,
    value: unknown //
) => {
    const user_id = "admin_user_id";

    const userLocalStorage = JSON.parse(localStorage.getItem(user_id) ?? "{}");
    userLocalStorage[key] = value;
    localStorage.setItem(user_id, JSON.stringify(userLocalStorage));
};

export const getFromUserLocalStorage = (key: string): string => {
    const user_id = "admin_user_id";

    const userLocalStorage = JSON.parse(localStorage.getItem(user_id) ?? "{}");
    return `${userLocalStorage?.[key]}`;
};

export const appendToProjectCanvasLocalStorage = (
    project_id: string, //
    canvas_id: string, //
    key: string,
    value: unknown
) => {
    if (project_id === "") return;
    if (canvas_id === "") return;
    const projectLocalStorage = JSON.parse(localStorage.getItem(project_id) ?? "{}");

    if (!projectLocalStorage?.canvases) projectLocalStorage.canvases = {};
    const canvasesLocalStorage = projectLocalStorage?.canvases || {};

    if (!canvasesLocalStorage[canvas_id]) projectLocalStorage.canvases[canvas_id] = {};

    projectLocalStorage.canvases[canvas_id][key] = value;
    localStorage.setItem(project_id, JSON.stringify(projectLocalStorage));
};

export const getFromProjectCanvasLocalStorage = <T>(
    project_id: string, //
    canvas_id: string, //
    key: string
): T | undefined => {
    if (project_id === "") return;
    if (canvas_id === "") return;
    const projectLocalStorage = JSON.parse(localStorage.getItem(project_id) ?? "{}");
    const canvasesLocalStorage = projectLocalStorage?.canvases || {};
    const canvasLocalStorage = canvasesLocalStorage[canvas_id] || {};
    return canvasLocalStorage?.[key] as T;
};

export const clearProjectCanvasHistoryLocalStorage = (project_id: string) => {
    if (project_id === "") return;

    const projectLocalStorage = JSON.parse(localStorage.getItem(project_id) ?? "{}");
    const canvasesLocalStorage = projectLocalStorage?.canvases || {};

    Object.keys(canvasesLocalStorage).forEach((canvas_id) => {
        delete canvasesLocalStorage[canvas_id].history;
        delete canvasesLocalStorage[canvas_id].historyIndex;
    });

    projectLocalStorage.canvases = canvasesLocalStorage;
    localStorage.setItem(project_id, JSON.stringify(projectLocalStorage));
};

export const appendToProjectLocalStorage = (
    project_id: string, //
    key: string,
    value: unknown
) => {
    if (project_id === "") return;
    const projectLocalStorage = JSON.parse(localStorage.getItem(project_id) ?? "{}");
    projectLocalStorage[key] = value;
    localStorage.setItem(project_id, JSON.stringify(projectLocalStorage));
};

export const getFromProjectLocalStorage = (
    project_id: string, //
    key: string
) => {
    if (project_id === "") return undefined;
    const projectLocalStorage = JSON.parse(localStorage.getItem(project_id) ?? "{}");
    return projectLocalStorage?.[key];
};

export const clearLoginTokens = () => {
    // Clears sessionStorage auth metadata (expiry, user_id, username) and
    // any legacy localStorage token keys that may exist from older sessions.
    sessionStorage.removeItem("authorization");
    localStorage.removeItem("token_storage");
    localStorage.removeItem("token_type");

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("project_")) localStorage.removeItem(key);
    });
};

export const clearSessionVar = (user_id: string, keysToDelete: string[]) => {
    if (!user_id) return;

    const itemState = sessionStorage.getItem(user_id) || "{}";
    const itemDict = JSON.parse(itemState);

    const _itemDict = Object.entries(itemDict)?.reduce(
        (acc, [key, val]) => {
            if (!!keysToDelete?.includes(key)) return acc;
            acc[key] = val;
            return acc;
        },
        {} as { [key: string]: unknown }
    );
    const _itemState = JSON.stringify(_itemDict);
    sessionStorage.setItem(user_id, _itemState);
};
