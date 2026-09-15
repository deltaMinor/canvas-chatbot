import axios from "axios";

import { AxiosApiResponse } from "#root/interfaces";
import {
    APPLICATION_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

import { setupApiInterceptors } from "./tokenRefresh";

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${APPLICATION_API_URL_PREFIX}`;

// eslint-disable-next-line import/no-named-as-default-member
const axios_api = axios.create({
    baseURL,
    headers: { ...baseHeaders },
});

setupApiInterceptors(axios_api);

export interface MockUser {
    user_id: string;
    username: string;
    display_name: string;
    is_admin: boolean;
    project_id: string;
    diagram_quota: number;
    diagrams_generated: number;
}

export const getMockUsers = async (): Promise<AxiosApiResponse<{ users: MockUser[] }>> => {
    return await axios_api.get("mock_users");
};

export const createMockUser = async (): Promise<AxiosApiResponse<{ user: MockUser }>> => {
    return await axios_api.post("mock_users");
};

export const deleteMockUser = async (
    userId: string
): Promise<AxiosApiResponse<{ user_id: string }>> => {
    return await axios_api.delete(`mock_users/${userId}`);
};

export const patchMockUserQuota = async (
    userId: string,
    diagramQuota: number
): Promise<AxiosApiResponse<{ user: MockUser }>> => {
    return await axios_api.patch(`mock_users/${userId}/quota`, {
        diagram_quota: diagramQuota,
    });
};
