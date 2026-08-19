import React from "react";

import { HandleType, Position } from "@xyflow/react";

import NodeHandleGroup from "#root/components/NodeHandleGroup";
import {
    HANDLE_STACK_VERTICAL_OFFSET_BTM,
    HANDLE_STACK_VERTICAL_OFFSET_LEFT,
    HANDLE_STACK_VERTICAL_OFFSET_RIGHT,
    HANDLE_STACK_VERTICAL_OFFSET_TOP,
    INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP,
    INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM,
} from "#root/constants/diagramConfig";
import {
    useDiagramIsConnecting,
    useDiagramIsConnectingHandleType,
    useDiagramView,
} from "#root/hooks/diagram";
import { EdgeHandleType } from "#root/interfaces/diagram";
import { getBackgroundColor } from "#root/utils/diagram/diagramStyleUtil";

interface InfoNodeHandlesProps {
    dataType: string;
    disableHandles?: boolean;
    isConnectable: boolean;
    hasBadgeBox: boolean;
    onHandleHover?: (hovered: boolean) => void;
}

const InfoNodeHandlesComponent = ({
    dataType,
    disableHandles = false,
    isConnectable,
    hasBadgeBox,
    onHandleHover,
}: InfoNodeHandlesProps) => {
    const diagramView = useDiagramView();
    const isConnecting = useDiagramIsConnecting();
    const isConnectingHandleType = useDiagramIsConnectingHandleType() as HandleType;
    const backgroundColor = React.useMemo(() => getBackgroundColor({ type: dataType }), [dataType]);
    const isThreatScenarioCanvas = React.useMemo(() => diagramView === "visualizer", [diagramView]);
    const opacity = React.useMemo(
        () => (disableHandles ? 0 : isThreatScenarioCanvas ? 0 : 1),
        [disableHandles, isThreatScenarioCanvas]
    );

    const topOffset = hasBadgeBox
        ? HANDLE_STACK_VERTICAL_OFFSET_TOP + INFO_NODE_BADGE_BLOCK_CONTAINER_OFFSET_TOP
        : HANDLE_STACK_VERTICAL_OFFSET_TOP;

    return (
        <>
            <NodeHandleGroup
                backgroundColor={backgroundColor}
                handlePosition={Position.Top}
                handleIdSource={EdgeHandleType.source_top}
                handleIdTarget={EdgeHandleType.target_top}
                isConnectable={!!isConnectable}
                isConnecting={isConnecting}
                isConnectingHandleType={isConnectingHandleType}
                style={{
                    top: topOffset, //
                    opacity, //
                }}
                {...(onHandleHover && { onHandleHover })}
            />
            <NodeHandleGroup
                backgroundColor={backgroundColor}
                handlePosition={Position.Bottom}
                handleIdSource={EdgeHandleType.source_bottom}
                handleIdTarget={EdgeHandleType.target_bottom}
                isConnectable={!!isConnectable}
                isConnecting={isConnecting}
                isConnectingHandleType={isConnectingHandleType}
                style={{
                    bottom:
                        HANDLE_STACK_VERTICAL_OFFSET_BTM +
                        INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM +
                        5, //
                    opacity, //
                }}
                {...(onHandleHover && { onHandleHover })}
            />
            <NodeHandleGroup
                backgroundColor={backgroundColor}
                handlePosition={Position.Left}
                handleIdSource={EdgeHandleType.source_left}
                handleIdTarget={EdgeHandleType.target_left}
                isConnectable={!!isConnectable}
                isConnecting={isConnecting}
                isConnectingHandleType={isConnectingHandleType}
                style={{
                    left: HANDLE_STACK_VERTICAL_OFFSET_LEFT,
                    opacity, //
                }}
                {...(onHandleHover && { onHandleHover })}
            />
            <NodeHandleGroup
                backgroundColor={backgroundColor}
                handlePosition={Position.Right}
                handleIdSource={EdgeHandleType.source_right}
                handleIdTarget={EdgeHandleType.target_right}
                isConnectable={!!isConnectable}
                isConnecting={isConnecting}
                isConnectingHandleType={isConnectingHandleType}
                style={{
                    right: HANDLE_STACK_VERTICAL_OFFSET_RIGHT, //
                    opacity, //
                }}
                {...(onHandleHover && { onHandleHover })}
            />
        </>
    );
};

export default React.memo(InfoNodeHandlesComponent);
