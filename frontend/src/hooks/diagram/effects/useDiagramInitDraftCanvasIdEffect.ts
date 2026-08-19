import React from "react";

import { useInitDraftCanvasId } from "#root/hooks/diagram";

export const useDiagramInitDraftCanvasIdEffect = () => {
    const initDraftCanvasId = useInitDraftCanvasId();

    React.useEffect(() => {
        initDraftCanvasId();
    }, [initDraftCanvasId]);
};
