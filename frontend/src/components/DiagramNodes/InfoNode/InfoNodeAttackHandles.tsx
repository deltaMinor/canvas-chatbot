import React from "react";

import { Position } from "@xyflow/react";

import NodeHandleGroup from "#root/components/NodeHandleGroup";
import {
    HANDLE_STACK_VERTICAL_OFFSET_BTM,
    HANDLE_STACK_VERTICAL_OFFSET_LEFT,
    HANDLE_STACK_VERTICAL_OFFSET_RIGHT,
    HANDLE_STACK_VERTICAL_OFFSET_TOP,
    INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP,
    INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM,
} from "#root/constants/diagramConfig";
import { useDiagramView, useNodeHandleEdgeMapping } from "#root/hooks/diagram";
import { EdgeHandleType } from "#root/interfaces/diagram";
import { getBackgroundColor } from "#root/utils/diagram/diagramStyleUtil";

interface InfoNodeAttackHandlesProps {
    nodeId: string;
    dataType: string;
    disableHandles?: boolean;
    hasBadgeBox: boolean;
    onHandleHover?: (hovered: boolean) => void;
}

const InfoNodeAttackHandlesComponent = ({
    nodeId,
    dataType,
    disableHandles = false,
    hasBadgeBox,
    onHandleHover,
}: InfoNodeAttackHandlesProps) => {
    const diagramView = useDiagramView();
    const nodeHandleEdgeMapping = useNodeHandleEdgeMapping();
    const backgroundColor = React.useMemo(() => getBackgroundColor({ type: dataType }), [dataType]);
    const isThreatScenarioCanvas = React.useMemo(() => diagramView === "visualizer", [diagramView]);
    const opacity = React.useMemo(
        () => (disableHandles ? 0 : isThreatScenarioCanvas ? 1 : 0),
        [disableHandles, isThreatScenarioCanvas]
    );
    const handles = nodeHandleEdgeMapping?.[nodeId]?.handles ?? {};

    const topOffset = hasBadgeBox
        ? HANDLE_STACK_VERTICAL_OFFSET_TOP + INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP
        : HANDLE_STACK_VERTICAL_OFFSET_TOP;
    const shouldRenderTopHandles =
        !!handles[EdgeHandleType.attack_source_top]?.length ||
        !!handles[EdgeHandleType.attack_target_top]?.length;
    const shouldRenderBottomHandles =
        !!handles[EdgeHandleType.attack_source_bottom]?.length ||
        !!handles[EdgeHandleType.attack_target_bottom]?.length;
    const shouldRenderLeftHandles =
        !!handles[EdgeHandleType.attack_source_left]?.length ||
        !!handles[EdgeHandleType.attack_target_left]?.length;
    const shouldRenderRightHandles =
        !!handles[EdgeHandleType.attack_source_right]?.length ||
        !!handles[EdgeHandleType.attack_target_right]?.length;

    return (
        <>
            {shouldRenderTopHandles && (
                <NodeHandleGroup
                    backgroundColor={backgroundColor}
                    handlePosition={Position.Top}
                    handleIdSource={EdgeHandleType.attack_source_top}
                    handleIdTarget={EdgeHandleType.attack_target_top}
                    isConnectable={false}
                    style={{
                        top: topOffset, //
                        opacity, //
                    }}
                    {...(onHandleHover && { onHandleHover })}
                />
            )}
            {shouldRenderBottomHandles && (
                <NodeHandleGroup
                    backgroundColor={backgroundColor}
                    handlePosition={Position.Bottom}
                    handleIdSource={EdgeHandleType.attack_source_bottom}
                    handleIdTarget={EdgeHandleType.attack_target_bottom}
                    isConnectable={false}
                    style={{
                        bottom:
                            HANDLE_STACK_VERTICAL_OFFSET_BTM +
                            INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM +
                            5, //
                        opacity, //
                    }}
                    {...(onHandleHover && { onHandleHover })}
                />
            )}
            {shouldRenderLeftHandles && (
                <NodeHandleGroup
                    backgroundColor={backgroundColor}
                    handlePosition={Position.Left}
                    handleIdSource={EdgeHandleType.attack_source_left}
                    handleIdTarget={EdgeHandleType.attack_target_left}
                    isConnectable={false}
                    style={{
                        left: HANDLE_STACK_VERTICAL_OFFSET_LEFT,
                        opacity, //
                    }}
                    {...(onHandleHover && { onHandleHover })}
                />
            )}
            {shouldRenderRightHandles && (
                <NodeHandleGroup
                    backgroundColor={backgroundColor}
                    handlePosition={Position.Right}
                    handleIdSource={EdgeHandleType.attack_source_right}
                    handleIdTarget={EdgeHandleType.attack_target_right}
                    isConnectable={false}
                    style={{
                        right: HANDLE_STACK_VERTICAL_OFFSET_RIGHT,
                        opacity, //
                    }}
                    {...(onHandleHover && { onHandleHover })}
                />
            )}
        </>
    );
};

export default React.memo(InfoNodeAttackHandlesComponent);
