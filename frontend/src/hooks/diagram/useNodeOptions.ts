import React from "react";

import { useArchitectureNodes } from "#root/hooks/diagram";
import { getNodeOptions } from "#root/utils/diagram/diagramUserStoryDrawerUtil";

export const useNodeOptions = () => {
    const architectureNodes = useArchitectureNodes();

    return React.useMemo(() => getNodeOptions(architectureNodes), [architectureNodes]);
};
