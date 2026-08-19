import React from "react";

import {
    useSelectedEdgeEndpointNode,
    useTargetEdgeId,
    useTargetEdgePulseToken,
} from "../projectDiagramFeatureHooks";

interface UseNodeEdgeEndpointPulseEffectParams {
    comparableNodeId: string;
    propsId: string;
    setHandlePulseToken: React.Dispatch<React.SetStateAction<number>>;
}

export const useNodeEdgeEndpointPulseEffect = ({
    comparableNodeId,
    propsId,
    setHandlePulseToken,
}: UseNodeEdgeEndpointPulseEffectParams) => {
    const targetEdgeId = useTargetEdgeId();
    const targetEdgePulseToken = useTargetEdgePulseToken();
    const isSelectedEdgeEndpoint = useSelectedEdgeEndpointNode({
        comparableNodeId,
        nodeId: propsId,
    });

    React.useEffect(() => {
        if (!isSelectedEdgeEndpoint) return;

        setHandlePulseToken((value) => value + 1);
    }, [isSelectedEdgeEndpoint, setHandlePulseToken, targetEdgeId, targetEdgePulseToken]);
};

export default useNodeEdgeEndpointPulseEffect;
