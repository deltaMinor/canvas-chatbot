import { defaultPhysicalLocationValues } from "#root/constants/diagramAttributes";
import { ProjectStepStatus } from "#root/constants/stepper";
import {
    CanvasNodeVariantType,
    CardNode,
    DiagramEdge,
    DiagramNode,
    UserStoryCardRef,
    UserStoryCardRefEnum,
    WarningMessage,
    WarningType,
} from "#root/interfaces/diagram";
import { ShortUuidIdentifierKey } from "#root/interfaces/identifier";
import { getLLMGenerationStatusFromApi } from "#root/services/domain/diagram";
import { getNodeToDataMapping } from "#root/utils/diagram/diagramUserStoryDrawerUtil";

import { generateShortUUID } from "../identifierUtil";

export const handleInitPolling = async ({
    project_id,
    canvas_id,
    polling_interval,
}: {
    project_id: string;
    canvas_id: string;
    polling_interval: number;
}) => {
    const { promise, stop } = initPolling({
        polling_interval,
        polling_func: async () => {
            const status = await getLLMGenerationStatusFromApi(
                project_id, //
                canvas_id,
                {},
                "data_flow"
            );
            return { ...status };
        },
    });
    void stop;
    return await promise;
};

export const initPolling = ({
    polling_interval,
    polling_func,
}: {
    polling_interval: number;
    snackbarKey?: string;
    polling_func: () => Promise<{
        status: number;
    }>;
}) => {
    let intervalId: NodeJS.Timeout;
    let rejectFn: (reason?: unknown) => void;
    let stopped = false;

    const promise = new Promise<{
        status: number;
    }>((resolve, reject) => {
        rejectFn = reject;
        intervalId = setInterval(async () => {
            if (stopped) return;
            try {
                const { status } = await polling_func();
                if (status === ProjectStepStatus.complete) {
                    clearInterval(intervalId);
                    resolve({
                        status,
                    });
                } else if (status !== ProjectStepStatus.inProgress) {
                    clearInterval(intervalId);
                    reject(new Error("Generation failed."));
                }
            } catch (err) {
                clearInterval(intervalId);
                reject(err);
            }
        }, polling_interval);
    });

    return {
        promise,
        stop: () => {
            stopped = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (rejectFn) {
                rejectFn(new Error("Generation aborted by user."));
            }
        },
    };
};
