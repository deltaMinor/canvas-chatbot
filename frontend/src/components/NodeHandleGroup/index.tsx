import React from "react";

import { HandleType, Position } from "@xyflow/react";

import { DEFAULT_ZINDEX_HANDLE_BTM, DEFAULT_ZINDEX_HANDLE_TOP } from "#root/constants/diagram";

import NodeHandle from "./NodeHandle";

interface NodeHandleGroupProps {
    backgroundColor: string;
    handleIdSource: string;
    handleIdTarget: string;
    handlePosition: Position;
    isConnectable: boolean;
    isConnecting?: boolean;
    isConnectingHandleType?: HandleType;
    //
    style?: React.CSSProperties;
    className?: string;
    onHandleHover?: (hovered: boolean) => void;
}

const NodeHandleGroupComponent = ({
    className = "",
    handleIdSource,
    handleIdTarget,
    style,
    isConnectable: props__isConnectable,
    isConnecting = false,
    isConnectingHandleType = "source",
    onHandleHover,
    ...props
}: NodeHandleGroupProps) => {
    const isSourceConnectable = React.useMemo(
        () => !!props__isConnectable && (!isConnecting || isConnectingHandleType === "target"),
        [isConnecting, isConnectingHandleType, props__isConnectable]
    );
    const isTargetConnectable = React.useMemo(
        () => !!props__isConnectable && !!isConnecting && isConnectingHandleType === "source",
        [isConnecting, isConnectingHandleType, props__isConnectable]
    );
    return (
        <>
            <NodeHandle
                handleId={handleIdSource} //
                handleType="source"
                className={className}
                style={{
                    ...style,
                    zIndex: DEFAULT_ZINDEX_HANDLE_TOP,
                }}
                isConnectable={!!isSourceConnectable}
                {...(onHandleHover && { onHandleHover })}
                {...props}
            />
            <NodeHandle
                handleId={handleIdTarget} //
                handleType="target"
                className={className}
                style={{
                    ...style,
                    zIndex: DEFAULT_ZINDEX_HANDLE_BTM,
                }}
                isConnectable={!!isTargetConnectable}
                {...(onHandleHover && { onHandleHover })}
                {...props}
            />
        </>
    );
};

export default React.memo(NodeHandleGroupComponent);
