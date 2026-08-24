import React from "react";

import { useProjectDiagram } from "#root/hooks/backendHooks";
import { evalIsNodeCardFieldMissing } from "#root/utils/diagram/diagramFooterTabsUtil";

export const useNodeCardFieldMissing = () => {
    const projectDiagram = useProjectDiagram();

    return React.useMemo(
        () =>
            evalIsNodeCardFieldMissing({
                canvas: projectDiagram?.canvas || [],
            }),
        [projectDiagram?.canvas]
    );
};
