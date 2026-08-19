import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { setDiagramRequestedThreatScenarioDrawerKey } from "#root/stores/projectDiagram/canvas";

export const useHandleClickViewNodes = () => {
    const instanceId = useDiagramInstanceId();

    const handleClick = React.useCallback(async () => {
        setDiagramRequestedThreatScenarioDrawerKey("nodes", instanceId);
    }, [instanceId]);

    return handleClick;
};

export default useHandleClickViewNodes;
