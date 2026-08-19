import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { setDiagramRequestedThreatScenarioDrawerKey } from "#root/stores/projectDiagram/canvas";

export const useHandleClickViewAllPaths = () => {
    const instanceId = useDiagramInstanceId();

    const handleClick = React.useCallback(async () => {
        setDiagramRequestedThreatScenarioDrawerKey("overview", instanceId);
    }, [instanceId]);

    return handleClick;
};

export default useHandleClickViewAllPaths;
