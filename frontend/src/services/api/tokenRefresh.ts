import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

/**
 * Creates a standardized request interceptor for API services.
 *
 * No authentication is enforced in this build: requests are sent as-is with
 * no token or credential injection.
 */
export const createRequestInterceptor = () => {
    return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
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
