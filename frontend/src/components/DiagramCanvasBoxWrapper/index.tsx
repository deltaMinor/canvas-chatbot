import React from "react";

import BoxWrapper from "#root/components/BoxWrapper";

interface DiagramCanvasBoxWrapperProps {
    children: React.ReactNode;
}

const DiagramCanvasBoxWrapperComponent = ({ children }: DiagramCanvasBoxWrapperProps) => {
    return (
        <BoxWrapper
            id="@xyflow/react"
            sx={{
                "& .react-flow__node": { pointerEvents: "none" },
                "& .react-flow__edge": { pointerEvents: "none" },
            }}
            className="diagram-canvas-box-wrapper"
        >
            {children}
        </BoxWrapper>
    );
};

export default React.memo(DiagramCanvasBoxWrapperComponent);
