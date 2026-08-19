import axios from "axios";

import { AxiosApiResponse } from "#root/interfaces";
import {
    AD_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${AD_API_URL_PREFIX}`;

const axios_json_api = axios.create({ baseURL, headers: { ...baseHeaders } });

export interface TopologyRunContextEntry {
    conversation_id: string;
    run_id: string;
    address: string;
    created_at: string;
}

class TopologyRunContextService {
    async record({
        project_id,
        conversation_id,
        run_id,
        address,
    }: {
        project_id: string;
        conversation_id: string;
        run_id: string;
        address: string;
    }): Promise<AxiosApiResponse<TopologyRunContextEntry>> {
        return await axios_json_api.post("topology_run_context", {
            project_id,
            conversation_id,
            run_id,
            address,
        });
    }

    async list({
        project_id,
        conversation_id,
    }: {
        project_id: string;
        conversation_id: string;
    }): Promise<AxiosApiResponse<{ runs: TopologyRunContextEntry[] }>> {
        return await axios_json_api.get("topology_run_context", {
            params: { project_id, conversation_id },
        });
    }

    async delete({
        project_id,
        conversation_id,
        run_id,
    }: {
        project_id: string;
        conversation_id: string;
        run_id: string;
    }): Promise<AxiosApiResponse<{ conversation_id: string; run_id: string }>> {
        return await axios_json_api.delete("topology_run_context", {
            data: { project_id, conversation_id, run_id },
        });
    }
}

export default TopologyRunContextService;
