import React from "react";

import { HandleType, Position } from "@xyflow/react";

import NodeHandleGroup from "#root/components/NodeHandleGroup";
import {
    HANDLE_STACK_VERTICAL_OFFSET_BTM,
    HANDLE_STACK_VERTICAL_OFFSET_LEFT,
    HANDLE_STACK_VERTICAL_OFFSET_RIGHT,
    HANDLE_STACK_VERTICAL_OFFSET_TOP,
} from "#root/constants/diagramConfig";
import { useDiagramIsConnecting, useDiagramIsConnectingHandleType } from "#root/hooks/diagram";
import { EdgeHandleType } from "#root/interfaces/diagram";
import { getBackgroundColor } from "#root/utils/diagram/diagramStyleUtil";

interface ClusterNodeHandlesProps {
    dataType: string;
    isConnectable: boolean;
    onHandleHover?: (hovered: boolean) => void;
}

const ClusterNodeHandlesComponent = ({
    dataType,
    isConnectable,
    onHandleHover,
}: ClusterNodeHandlesProps) => {
    const isConnecting = useDiagramIsConnecting();
    const isConnectingHandleType = useDiagramIsConnectingHandleType() as HandleType;
    const backgroundColor = React.useMemo(() => getBackgroundColor({ type: dataType }), [dataType]);

    // Cluster nodes need real handles so edges can attach to them, but the
    // dots themselves shouldn't be visible to the user on any canvas view.
    const opacity = 0;

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
                    top: HANDLE_STACK_VERTICAL_OFFSET_TOP, //
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
                    bottom: HANDLE_STACK_VERTICAL_OFFSET_BTM, //
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

export default React.memo(ClusterNodeHandlesComponent);
