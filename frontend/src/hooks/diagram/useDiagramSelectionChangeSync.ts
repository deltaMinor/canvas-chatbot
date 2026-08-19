import { useOnSelectionChange } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import {
    setDiagramSelectedEdgeIdList,
    setDiagramSelectedNodeIdList,
} from "#root/stores/projectDiagram/selection";

export const useDiagramSelectionChangeSync = () => {
    const instanceId = useDiagramInstanceId();

    useOnSelectionChange({
        onChange: (props) => {
            const selectedNodeIdList = props?.nodes?.map((node) => node.id) || [];
            const selectedEdgeIdList = props?.edges?.map((edge) => edge.id) || [];

            setDiagramSelectedNodeIdList(selectedNodeIdList, instanceId);
            setDiagramSelectedEdgeIdList(selectedEdgeIdList, instanceId);
        },
    });
};
