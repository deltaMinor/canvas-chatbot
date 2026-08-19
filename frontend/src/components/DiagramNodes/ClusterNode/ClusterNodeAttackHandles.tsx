import React from "react";

import { Position } from "@xyflow/react";

import NodeHandleGroup from "#root/components/NodeHandleGroup";
import {
    HANDLE_STACK_VERTICAL_OFFSET_BTM,
    HANDLE_STACK_VERTICAL_OFFSET_LEFT,
    HANDLE_STACK_VERTICAL_OFFSET_RIGHT,
    HANDLE_STACK_VERTICAL_OFFSET_TOP,
} from "#root/constants/diagramConfig";
import { useNodeHandleEdgeMapping } from "#root/hooks/diagram";
import { EdgeHandleType } from "#root/interfaces/diagram";
import { getBackgroundColor } from "#root/utils/diagram/diagramStyleUtil";

interface ClusterNodeAttackHandlesProps {
    nodeId: string;
    dataType: string;
    opacity: number;
    onHandleHover?: (hovered: boolean) => void;
}

const ClusterNodeAttackHandlesComponent = ({
    nodeId,
    dataType,
    opacity,
    onHandleHover,
}: ClusterNodeAttackHandlesProps) => {
    const nodeHandleEdgeMapping = useNodeHandleEdgeMapping();
    const backgroundColor = React.useMemo(() => getBackgroundColor({ type: dataType }), [dataType]);
    const handles = nodeHandleEdgeMapping?.[nodeId]?.handles ?? {};
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
                        top: HANDLE_STACK_VERTICAL_OFFSET_TOP,
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
                        bottom: HANDLE_STACK_VERTICAL_OFFSET_BTM,
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

export default React.memo(ClusterNodeAttackHandlesComponent);
