export const APPLICATION_API_URL_PREFIX =
    import.meta.env["VITE_API_URL_PREFIX_APPLICATION"] || "api/v1/application";
export const AD_API_URL_PREFIX =
    import.meta.env["VITE_API_URL_PREFIX_AD"] || "api/v1/architecture_diagram";

export const baseHeaders = { "Content-type": "application/json" };

export const SINGLE_ORIGIN_SERVER_BASE_URL = window.location.origin;
