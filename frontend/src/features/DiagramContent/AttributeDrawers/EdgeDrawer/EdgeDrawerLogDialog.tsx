import React from "react";

import LogDialogs from "#root/components/LogDialogs";
import { LogDialogStateEnum } from "#root/enums/dialog";
import { useDiagramDraftEdge } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { getProjectDiagramEdgeLogsFromApi } from "#root/services/domain/diagram";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

const EdgeDrawerLogDialogComponent = () => {
    const logDialogState = useDialogState();
    const draftEdge = useDiagramDraftEdge();

    const handleCloseLogDialog = React.useCallback(async () => {
        await handleCloseDialogAsync(LogDialogStateEnum.projectDiagramEdge);
    }, []);

    if (!draftEdge?.id) return null;

    const logDialogProps = [
        {
            stateKey: LogDialogStateEnum.projectDiagramEdge, //
            title: `Diagram Edge Logs`,
            subtitle: `Edge ID: ${draftEdge.id}`,
            getLogs: async () => {
                const project_id = getProjectIdFromStore();
                return await getProjectDiagramEdgeLogsFromApi(
                    { project_id, edge_id: draftEdge.id }, //
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

export default EdgeDrawerLogDialogComponent;
