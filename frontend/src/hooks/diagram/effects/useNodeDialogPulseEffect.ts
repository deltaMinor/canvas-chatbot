import React from "react";

import { DiagramNode } from "#root/interfaces/diagram";

import {
    useDialogSelectedNode,
    useSelectedAttackStepNode,
    useTargetNodeId,
    useTargetNodePulseToken,
} from "../projectDiagramFeatureHooks";

interface UseNodeDialogPulseEffectParams {
    comparableNodeId: string;
    overlayOpacity: number;
    propsData: DiagramNode["data"];
    propsId: string;
    propsParentId: string | undefined;
    propsType: string | undefined;
    setHandlePulseToken: React.Dispatch<React.SetStateAction<number>>;
}

export const useNodeDialogPulseEffect = ({
    comparableNodeId,
    overlayOpacity,
    propsData,
    propsId,
    propsParentId,
    propsType,
    setHandlePulseToken,
}: UseNodeDialogPulseEffectParams) => {
    const targetNodeId = useTargetNodeId();
    const targetNodePulseToken = useTargetNodePulseToken();
    const isDialogSelected = useDialogSelectedNode({
        comparableNodeId,
        nodeId: propsId,
    });
    const isSelectedAttackStepNode = useSelectedAttackStepNode({
        comparableNodeId,
        nodeId: propsId,
    });

    React.useEffect(() => {
        if (!isDialogSelected) return;

        setHandlePulseToken((value) => value + 1);
    }, [
        isSelectedAttackStepNode,
        overlayOpacity,
        propsData,
        propsId,
        propsParentId,
        propsType,
        isDialogSelected,
        setHandlePulseToken,
        targetNodeId,
        targetNodePulseToken,
    ]);
};

export default useNodeDialogPulseEffect;
