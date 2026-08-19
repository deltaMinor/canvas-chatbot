import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useSetDiagramIsAttributeDrawerOpen } from "#root/hooks/diagram";

import { getDiagramNextAttributeDrawerOpenFromStore } from "./useDiagramNextAttributeDrawerOpen";

export const useSyncAttributeDrawerOpen = () => {
    const instanceId = useDiagramInstanceId();
    const setDiagramIsAttributeDrawerOpen = useSetDiagramIsAttributeDrawerOpen();

    return React.useCallback(() => {
        const nextIsAttributeDrawerOpen = getDiagramNextAttributeDrawerOpenFromStore(instanceId);
        setDiagramIsAttributeDrawerOpen(nextIsAttributeDrawerOpen);
    }, [instanceId, setDiagramIsAttributeDrawerOpen]);
};

export default useSyncAttributeDrawerOpen;
