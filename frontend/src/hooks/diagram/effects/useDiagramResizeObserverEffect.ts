import React from "react";

import { initResizeObserver } from "#root/utils/diagram/diagramCanvasInteractionUtil";

export const useDiagramResizeObserverEffect = () => {
    React.useEffect(() => {
        initResizeObserver();
    }, []);
};
