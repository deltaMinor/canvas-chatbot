import React from "react";

import { useNodeDialogPulseEffect, useNodeEdgeEndpointPulseEffect } from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";

interface DiagramClusterNodeEffectsProps {
    comparableNodeId: string;
    propsId: string;
    overlayOpacity: number;
    propsData: DiagramNode["data"];
    propsParentId: string | undefined;
    propsType: string | undefined;
    setHandlePulseToken: React.Dispatch<React.SetStateAction<number>>;
}

const DiagramClusterNodeEffects = ({
    comparableNodeId,
    propsId,
    overlayOpacity,
    propsData,
    propsParentId,
    propsType,
    setHandlePulseToken,
}: DiagramClusterNodeEffectsProps) => {
    useNodeDialogPulseEffect({
        comparableNodeId,
        propsId,
        overlayOpacity,
        propsData,
        propsParentId,
        propsType,
        setHandlePulseToken,
    });

    useNodeEdgeEndpointPulseEffect({
        comparableNodeId,
        propsId,
        setHandlePulseToken,
    });

    return null;
};

export default DiagramClusterNodeEffects;
