import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { MOCK_USER_HEADER, getStoredMockUserId } from "#root/lib/mockUser";

/**
 * Creates a standardized request interceptor for API services.
 *
 * No real authentication is enforced in this build: requests are sent as-is
 * with no token or credential injection. The one exception is the mock
 * multi-user simulation (see `#root/lib/mockUser`), which attaches whichever
 * mock user is currently "acting" so the backend can resolve which
 * project's PDFs/JSON belong to this request.
 */
export const createRequestInterceptor = () => {
    return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const mockUserId = getStoredMockUserId();
        if (mockUserId) {
            config.headers.set(MOCK_USER_HEADER, mockUserId);
        }
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
 * No authentication is enforced in this build, so there is no 401-driven
 * redirect or token cleanup to perform here.
 */
export const createErrorInterceptor = () => {
    return async (err: AxiosError): Promise<AxiosResponse> => {
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
