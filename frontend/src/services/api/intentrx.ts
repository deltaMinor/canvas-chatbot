import axios from "axios";

import { AxiosApiResponse } from "#root/interfaces";
import {
    AD_API_URL_PREFIX,
    SINGLE_ORIGIN_SERVER_BASE_URL,
    baseHeaders,
} from "#root/lib/http-common";

const baseURL = `${SINGLE_ORIGIN_SERVER_BASE_URL}/${AD_API_URL_PREFIX}`;

const axios_json_api = axios.create({ baseURL, headers: { ...baseHeaders } });

export interface IntentRXPanel {
    title: string | null;
    text: string;
}

export interface IntentRXTurnResult {
    panels: IntentRXPanel[];
    ended: boolean;
}

export type IntentRXApp = "onto" | "intent" | "topology";

export interface FileReadResult {
    exists: boolean;
    mtime?: number;
    size?: number;
    content?: string;
    error?: string;
}

export interface ProgressReadResult {
    text: string;
}

export interface StatusReadResult {
    running: boolean;
    busy: boolean;
}

class IntentRXService {
    async start({
        session_id,
        app,
        project_id,
        conversation_id,
        chat_state,
    }: {
        session_id: string;
        app?: IntentRXApp | undefined;
        project_id?: string | undefined;
        conversation_id?: string | undefined;
        chat_state?: number | undefined;
    }): Promise<AxiosApiResponse<IntentRXTurnResult>> {
        return await axios_json_api.post("intentrx/start", {
            session_id,
            app,
            project_id,
            conversation_id,
            chat_state,
        });
    }

    async sendMessage({
        session_id,
        text,
        project_id,
        conversation_id,
        chat_state,
    }: {
        session_id: string;
        text: string;
        project_id?: string | undefined;
        conversation_id?: string | undefined;
        chat_state?: number | undefined;
    }): Promise<AxiosApiResponse<IntentRXTurnResult>> {
        return await axios_json_api.post("intentrx/message", {
            session_id,
            text,
            project_id,
            conversation_id,
            chat_state,
        });
    }

    async readFile({ path }: { path: string }): Promise<AxiosApiResponse<FileReadResult>> {
        return await axios_json_api.post("intentrx/file", { path });
    }

    async progress({
        session_id,
    }: {
        session_id: string;
    }): Promise<AxiosApiResponse<ProgressReadResult>> {
        return await axios_json_api.post("intentrx/progress", { session_id });
    }

    async status({
        session_id,
    }: {
        session_id: string;
    }): Promise<AxiosApiResponse<StatusReadResult>> {
        return await axios_json_api.post("intentrx/status", { session_id });
    }

    async stop({
        session_id,
    }: {
        session_id: string;
    }): Promise<AxiosApiResponse<{ text: string; ended: boolean }>> {
        return await axios_json_api.post("intentrx/stop", { session_id });
    }
}

export default IntentRXService;
