import React from "react";

import { useReactFlow } from "@xyflow/react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { setDiagramRequestedThreatScenarioDrawerKey } from "#root/stores/projectDiagram/canvas";

export const useHandleClickViewAttackPath = () => {
    const instanceId = useDiagramInstanceId();
    useReactFlow<DiagramNode, DiagramEdge>();

    const handleClick = React.useCallback(async () => {
        setDiagramRequestedThreatScenarioDrawerKey("attackPath", instanceId);
    }, [instanceId]);

    return handleClick;
};

export default useHandleClickViewAttackPath;
