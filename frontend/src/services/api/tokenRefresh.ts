import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// import { TokenManager } from "#root/utils/tokenManager";

// const AUTH_FLOW_PATHS = [
//     "user/login",
//     "user/verify",
//     "user/refresh",
//     "app_preflight",
//     "superuser/signup",
// ];
// const API_REDIRECT_BASE_URL = (import.meta.env["VITE_API_REDIRECT_BASE_URL"] || "").replace(
//     /\/+$/,
//     ""
// );

// let hasTriggeredApiOriginRedirect = false;

// const isAuthFlowRequest = (err: AxiosError): boolean => {
//     const requestUrl = err.config?.url || "";
//     return AUTH_FLOW_PATHS.some((path) => requestUrl.includes(path));
// };

// const shouldRedirectApiOriginRequest = (config: InternalAxiosRequestConfig): boolean => {
//     if (!API_REDIRECT_BASE_URL || hasTriggeredApiOriginRedirect) return false;

//     const requestUrl = new URL(config.url || "", config.baseURL || window.location.origin);
//     const redirectUrl = new URL(API_REDIRECT_BASE_URL);

//     return (
//         requestUrl.origin === window.location.origin &&
//         requestUrl.pathname.startsWith("/api/") &&
//         redirectUrl.origin !== window.location.origin
//     );
// };

/**
 * Creates a standardized request interceptor for API services.
 *
 * Authentication tokens are stored in HttpOnly cookies and sent automatically
 * by the browser — no Authorization header injection is needed or desirable
 * (adding it would require reading the token from storage, which defeats the
 * purpose of HttpOnly cookies).
 */
export const createRequestInterceptor = () => {
    return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // withCredentials ensures the browser sends the HttpOnly auth cookies
        // (access_token, refresh_token, sessionid) with every cross-origin request.
        // config.withCredentials = true;

        // X-Requested-With identifies the request as an XHR call, which is a
        // lightweight signal that some CSRF defences look for.
        // if (config.headers) {
        //     config.headers["X-Requested-With"] = "XMLHttpRequest";
        // }

        return config;
    };
};

/**
 * Creates a standardized response interceptor for API services.
 */
export const createResponseInterceptor = () => {
    return (res: AxiosResponse): AxiosResponse => res;
};

/**
 * Creates a standardized error interceptor for API services.
 *
 * On 401 the local session metadata is cleared and the user is redirected to
 * the login page. The backend has already expired or revoked the HttpOnly
 * cookies so no further client-side token cleanup is required.
 */
export const createErrorInterceptor = () => {
    return async (err: AxiosError): Promise<AxiosResponse> => {
        // if (err.response?.status === 401 && !isAuthFlowRequest(err)) {
        //     TokenManager.clearAll();
        //     window.location.href = "/login";
        // }
        return Promise.reject(err);
    };
};

/**
 * Sets up standardized interceptors for an axios instance.
 */
export const setupApiInterceptors = (axiosInstance: AxiosInstance): void => {
    axiosInstance.interceptors.request.use(createRequestInterceptor(), (error: AxiosError) =>
        Promise.reject(error)
    );
    axiosInstance.interceptors.response.use(createResponseInterceptor(), createErrorInterceptor());
};
