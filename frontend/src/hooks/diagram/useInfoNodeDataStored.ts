import React from "react";

import { useProjectDiagram } from "#root/hooks/backendHooks";
import { ProjectDiagram, UserStoryCardRefEnum } from "#root/interfaces/diagram";

interface InfoNodeDataStored {
    count: number;
    labels: string[];
}

export const useInfoNodeDataStored = (nodeDataStored: unknown) => {
    const projectDiagram = (useProjectDiagram() ??
        ({
            canvas: [],
            card_nodes: [],
        } as Partial<ProjectDiagram>)) as ProjectDiagram;
    const projectCardNodes = projectDiagram?.card_nodes;

    return React.useMemo<InfoNodeDataStored | null>(() => {
        const dataStoredUuids = (nodeDataStored as string[]) || [];
        if (dataStoredUuids.length === 0) return null;

        const cardNodes = projectCardNodes || [];
        const dataNodes = cardNodes.filter(
            (node) => node.ref_key === UserStoryCardRefEnum.card_data
        );

        const dataLabels = dataStoredUuids
            .map((uuid) => {
                const dataNode = dataNodes.find((node) => node.value === uuid);
                return dataNode?.label;
            })
            .filter((label): label is string => !!label);

        return {
            count: dataStoredUuids.length,
            labels: dataLabels,
        };
    }, [nodeDataStored, projectCardNodes]);
};
