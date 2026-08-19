import React from "react";

import { OptionLabel } from "#root/interfaces";
import { CardNode } from "#root/interfaces/diagram";
import { getNodeToDataMapping } from "#root/utils/diagram/diagramUserStoryDrawerUtil";

import {
    useArchitectureNodes,
    useDiagramDraftCanvasRef,
    useSetDiagramUserStoryPendingSelectedDataNodesMapping,
} from "./projectDiagramFeatureHooks";
import { useNodeOptions } from "./useNodeOptions";

export const useUserStoryDataItemPendingSelectedDataNodesEffect = () => {
    const architectureNodes = useArchitectureNodes();
    const draftCanvasRef = useDiagramDraftCanvasRef();
    const nodeOptions = useNodeOptions();
    const setPendingSelectedDataNodesMapping =
        useSetDiagramUserStoryPendingSelectedDataNodesMapping();

    React.useEffect(() => {
        const dataItems = (draftCanvasRef?.card_ref?.card_data || []) as CardNode[];
        const nodeToDataMapping = getNodeToDataMapping(architectureNodes);

        setPendingSelectedDataNodesMapping(
            Object.fromEntries(
                dataItems.map((item) => {
                    const nodeIdList = nodeToDataMapping
                        ?.filter((mapping) => !!mapping.data_stored?.includes(item.value))
                        ?.map((mapping) => mapping.id);
                    const selectedDataNodes: OptionLabel[] =
                        nodeOptions?.filter((node) => !!nodeIdList?.includes(node.value)) || [];

                    return [item.value, selectedDataNodes];
                })
            )
        );
    }, [
        architectureNodes,
        draftCanvasRef?.card_ref?.card_data,
        nodeOptions,
        setPendingSelectedDataNodesMapping,
    ]);
};
