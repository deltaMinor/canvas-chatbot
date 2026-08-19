import React from "react";

import { useActiveNodes } from "#root/hooks/diagram";

export const useCanvasNodes = () => {
    const activeNodes = useActiveNodes();

    return React.useMemo(() => activeNodes, [activeNodes]);
};
