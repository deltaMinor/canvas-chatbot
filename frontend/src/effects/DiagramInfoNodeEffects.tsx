import React from "react";

import {
    useNodeDialogPulseEffect,
    useNodeEdgeEndpointPulseEffect,
    useNodeHoverPulseEffect,
} from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";

interface DiagramInfoNodeEffectsProps {
    comparableNodeId: string;
    isHovered?: boolean;
    propsId: string;
    overlayOpacity: number;
    propsData: DiagramNode["data"];
    propsParentId: string | undefined;
    propsType: string | undefined;
    setHandlePulseToken: React.Dispatch<React.SetStateAction<number>>;
}

const DiagramInfoNodeEffects = ({
    comparableNodeId,
    isHovered = false,
    propsId,
    overlayOpacity,
    propsData,
    propsParentId,
    propsType,
    setHandlePulseToken,
}: DiagramInfoNodeEffectsProps) => {
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

    useNodeHoverPulseEffect({
        isHovered,
        setHandlePulseToken,
    });

    return null;
};

export default DiagramInfoNodeEffects;
