import React from "react";

import { Handle, HandleType, Position } from "@xyflow/react";

import { DEFAULT_HANDLE_SIZE } from "#root/constants/diagram";

interface NodeHandleProps {
    backgroundColor: string;
    className?: string;
    handleId: string;
    handlePosition: Position;
    handleType: HandleType;
    isConnectable?: boolean;
    isConnecting?: boolean;
    style?: React.CSSProperties;
    onHandleHover?: (hovered: boolean) => void;
}

const NodeHandleComponent = ({
    backgroundColor,
    handleId,
    handlePosition,
    handleType,
    style = {},
    isConnectable,
    className = "",
    onHandleHover,
}: NodeHandleProps) => {
    const {
        opacity = 1, //
        ..._style
    } = style;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = React.useCallback(() => {
        setIsHovered(true);
        onHandleHover?.(true);
    }, [onHandleHover]);

    const handleMouseLeave = React.useCallback(() => {
        setIsHovered(false);
        onHandleHover?.(false);
    }, [onHandleHover]);

    const baseStyle = {
        width: DEFAULT_HANDLE_SIZE,
        height: DEFAULT_HANDLE_SIZE,
        border: "2px solid rgba(255, 255, 255, 0.92)",
        borderRadius: "999px",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
    };
    const hoveredStyle = {
        width: DEFAULT_HANDLE_SIZE * 1.35,
        height: DEFAULT_HANDLE_SIZE * 1.35,
        border: "2px solid rgba(255, 255, 255, 0.96)",
        borderRadius: "999px",
        boxShadow:
            "0 0 0 5px rgba(147, 51, 234, 0.22), 0 0 0 10px rgba(147, 51, 234, 0.08), 0 8px 18px rgba(15, 23, 42, 0.24)",
    };
    const handleTransition =
        "width 0.15s ease-out, height 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out";

    return (
        <Handle
            type={handleType}
            position={handlePosition}
            id={handleId}
            isConnectable={isConnectable ?? true}
            className={`${className || ""} `}
            style={{
                backgroundColor,
                opacity,
                borderWidth: 0,
                transition: handleTransition,
                ...(isHovered ? hoveredStyle : baseStyle),
                ..._style,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
};

export default React.memo(NodeHandleComponent);
