import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { WarningReport } from "#root/interfaces/diagram";
import { postValidateTosca } from "#root/services/domain/tosca";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { setDiagramToscaReportMapping } from "#root/stores/projectDiagram/toscaValidation";

export const useRefreshToscaReportMapping = () => {
    const instanceId = useDiagramInstanceId();

    return React.useCallback(async () => {
        const project_id = getProjectIdFromStore();
        if (!project_id) return;
        await postValidateTosca({ project_id }, {})
            .then((updated_canvas) => {
                const nextToscaReportMapping: { [id: string]: WarningReport[] } = {};

                updated_canvas.forEach((canvas) => {
                    nextToscaReportMapping[canvas.canvas_id] = canvas.warnings;
                });

                setDiagramToscaReportMapping(nextToscaReportMapping, instanceId);
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
            });
    }, [instanceId]);
};
