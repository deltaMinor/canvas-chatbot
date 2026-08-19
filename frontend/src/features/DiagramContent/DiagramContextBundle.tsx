import React from "react";

import { ReactFlowProvider } from "@xyflow/react";

import { DiagramInstanceContext } from "#root/contexts/DiagramInstanceContext";
import DiagramInstanceEffects from "#root/effects/DiagramInstanceEffects";
import { DiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";

interface DiagramContextBundleProps {
    instanceId: string;
    getInitialState?: () => Partial<DiagramInstanceState>;
    children?: React.ReactNode;
}

const DiagramContextBundleComponent = ({
    instanceId,
    getInitialState,
    children,
}: DiagramContextBundleProps) => {
    const initialState = getInitialState?.();

    return (
        <DiagramInstanceContext.Provider value={instanceId}>
            <ReactFlowProvider>
                <DiagramInstanceEffects {...(initialState ? { initialState } : {})} />
                {children}
            </ReactFlowProvider>
        </DiagramInstanceContext.Provider>
    );
};

export default DiagramContextBundleComponent;
