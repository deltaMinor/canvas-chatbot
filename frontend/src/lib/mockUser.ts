export const MOCK_USER_HEADER = "X-Mock-User-Id";

const MOCK_USER_ID_STORAGE_KEY = "tm_mock_user_id";
const MOCK_USER_PROJECT_ID_STORAGE_KEY = "tm_mock_user_project_id";

export const MOCK_USER_CHANGED_EVENT = "tm-mock-user-changed";

export const getStoredMockUserId = (): string => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(MOCK_USER_ID_STORAGE_KEY) ?? "";
};

export const getStoredMockUserProjectId = (): string => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(MOCK_USER_PROJECT_ID_STORAGE_KEY) ?? "";
};

export const setStoredMockUser = (userId: string, projectId: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MOCK_USER_ID_STORAGE_KEY, userId);
    window.localStorage.setItem(MOCK_USER_PROJECT_ID_STORAGE_KEY, projectId);
    window.dispatchEvent(new Event(MOCK_USER_CHANGED_EVENT));
};
