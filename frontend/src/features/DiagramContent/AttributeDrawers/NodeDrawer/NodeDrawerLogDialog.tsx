import React from "react";

import LogDialogs from "#root/components/LogDialogs";
import { LogDialogStateEnum } from "#root/enums/dialog";
import { useDiagramDraftNode } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { getProjectDiagramNodeLogsFromApi } from "#root/services/domain/diagram";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

const NodeDrawerDialogConfirmComponent = () => {
    const logDialogState = useDialogState();
    const draftNode = useDiagramDraftNode();

    const handleCloseLogDialog = React.useCallback(async () => {
        await handleCloseDialogAsync(LogDialogStateEnum.projectDiagramNode);
    }, []);

    if (!draftNode?.id) return null;

    const logDialogProps = [
        {
            stateKey: LogDialogStateEnum.projectDiagramNode, //
            title: `Diagram Node Logs`,
            subtitle: `Node ID:  ${draftNode.id} | Node Label: ${draftNode?.data?.label}`,
            getLogs: async () => {
                const project_id = getProjectIdFromStore();
                return await getProjectDiagramNodeLogsFromApi(
                    { project_id, node_id: draftNode.id }, //
                    {}
                );
            },
        },
    ];

    return (
        <LogDialogs
            logDialogProps={logDialogProps}
            logDialogState={logDialogState}
            handleCloseLogDialog={handleCloseLogDialog} //
        />
    );
};

export default NodeDrawerDialogConfirmComponent;
