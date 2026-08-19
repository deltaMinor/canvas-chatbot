import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { setDiagramRequestedThreatScenarioDrawerKey } from "#root/stores/projectDiagram/canvas";

export const useHandleClickViewEdges = () => {
    const instanceId = useDiagramInstanceId();

    const handleClick = React.useCallback(async () => {
        setDiagramRequestedThreatScenarioDrawerKey("edges", instanceId);
    }, [instanceId]);

    return handleClick;
};

export default useHandleClickViewEdges;
