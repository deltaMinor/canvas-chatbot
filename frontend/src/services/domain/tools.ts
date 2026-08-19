import { enqueueSnackbar } from "notistack";

import { ServiceDomainProps } from "#root/interfaces/domain";

import { ApplicationService } from "../api/application";

import { processDomainFailure } from "./helper";

export interface ToolHistoryItem {
    tool_history_id: string;
    tool_key: string;
    tool_label?: string;
    action?: string;
    status?: string;
    task_id?: string;
    timestamp?: string;
    user_id?: string;
    username?: string;
    email?: string;
    result?: Record<string, unknown>;
}

export interface ToolScanResult {
    tool_key: string;
    can_execute: boolean;
    status: string;
    message: string;
    result_message?: string;
    details?: Record<string, unknown>;
    tool_history?: ToolHistoryItem;
}
export interface ToolActionResult {
    migration_key?: string;
    task_id?: string;
    tool_history?: ToolHistoryItem;
}

export interface ToolProgressResult {
    tool_key: string;
    task_id: string;
    state: string;
    status: string;
    percentage: number;
    message?: string;
    current?: number;
    total?: number;
    ready?: boolean;
    successful?: boolean;
    result?: Record<string, unknown>;
}

export const triggerToolAction = async (
    toolKey: string,
    serviceDomainProps: ServiceDomainProps = {}
): Promise<ToolActionResult> => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();

    return await ApplicationApi.triggerToolAction(toolKey)
        .then((response) => {
            const toolAction = response.data.data as ToolActionResult;
            if (!hideSnackbar) {
                enqueueSnackbar("Tool action has been triggered successfully.", {
                    variant: "success",
                });
            }
            return toolAction;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const scanToolAction = async (
    toolKey: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const ApplicationApi = new ApplicationService();

    return await ApplicationApi.scanToolAction(toolKey)
        .then((response) => response.data.data as ToolScanResult)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const triggerMigrationTool = async (
    migrationKey: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    return await triggerToolAction(migrationKey, serviceDomainProps);
};

export const getToolActionProgress = async (
    toolKey: string,
    taskId: string,
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const ApplicationApi = new ApplicationService();

    return await ApplicationApi.getToolActionProgress(toolKey, taskId)
        .then((response) => response.data.data as ToolProgressResult)
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getToolHistory = async (serviceDomainProps: ServiceDomainProps = {}) => {
    const ApplicationApi = new ApplicationService();

    return await ApplicationApi.getToolHistory()
        .then((response) => response.data.data.tool_history as ToolHistoryItem[])
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
