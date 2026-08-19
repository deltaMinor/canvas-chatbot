import React from "react";

import BoxWrapper from "#root/components/BoxWrapper";
import { useDiagramDraftCanvasViewOnly } from "#root/hooks/diagram";
import { getReactFlowSx } from "#root/utils/diagram/diagramCanvasStyleUtil";

interface DiagramCanvasBoxWrapperProps {
    children: React.ReactNode;
}

const DiagramCanvasBoxWrapperComponent = ({ children }: DiagramCanvasBoxWrapperProps) => {
    const selectedCanvasViewOnly = useDiagramDraftCanvasViewOnly();

    const reactFlowSx: { [key: string]: unknown } = React.useMemo(() => {
        return getReactFlowSx({
            isAuthorizedToUpdate: true,
            isCanvasEditable: !selectedCanvasViewOnly,
        });
    }, [selectedCanvasViewOnly]);

    return (
        <BoxWrapper
            id="@xyflow/react"
            sx={reactFlowSx}
            className="diagram-canvas-box-wrapper"
        >
            {children}
        </BoxWrapper>
    );
};

export default React.memo(DiagramCanvasBoxWrapperComponent);
