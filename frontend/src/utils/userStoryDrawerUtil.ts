import { DiagramNode } from "#root/interfaces/diagram";

export const updateArchitectureNodesDataStored = (
    architectureNodes: DiagramNode[],
    selectedNodeIds: string[],
    dataItemValue: string
): DiagramNode[] => {
    return architectureNodes.map((node) => {
        const data_stored = (node.data?.["data_stored"] as string[]) || [];
        if (selectedNodeIds.includes(node.id)) {
            const nextDataStored = [...new Set([...data_stored, dataItemValue])].sort();
            return {
                ...node,
                data: {
                    ...node.data,
                    data_stored: nextDataStored,
                },
            };
        }

        const nextDataStored = [...new Set(data_stored.filter((d) => d !== dataItemValue))].sort();
        return {
            ...node,
            data: {
                ...node.data,
                data_stored: nextDataStored,
            },
        };
    });
};
