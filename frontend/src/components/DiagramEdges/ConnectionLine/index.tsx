import { ConnectionLineComponentProps, Position, getBezierPath } from "@xyflow/react";

import { CanvasEdgeColor } from "#root/constants/diagram";
import { DiagramComponentType } from "#root/interfaces/diagram";

const getFrom = (fromX: number, fromY: number, fromPosition: Position) => {
    const sourceX = fromX + 0;
    let sourceY = fromY + 0;
    switch (fromPosition) {
        case Position.Top:
            sourceY += 0;
            break;
        case Position.Bottom:
            sourceY += 0;
            break;
    }
    return { sourceX, sourceY };
};

const ConnectionLine = (props: ConnectionLineComponentProps) => {
    const { fromX, fromY, toX, toY, fromHandle, fromPosition } = props;
    const { sourceX, sourceY } = getFrom(fromX, fromY, fromPosition);
    const sourcePosition = (fromHandle?.id || "")?.includes("_top")
        ? Position.Top
        : Position.Bottom;
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX: toX,
        targetY: toY,
    });
    const handleType = fromHandle?.id
        ?.replace("target_", "")
        ?.replace("source_", "")
        ?.replace("_top", "")
        ?.replace("_bottom", "");
    const stroke =
        handleType === DiagramComponentType.architecture
            ? `${CanvasEdgeColor.architecture}`
            : `${CanvasEdgeColor.data_flow}`;
    return (
        <>
            <path
                fill="none" //
                className="animated"
                d={edgePath}
                stroke={stroke}
                strokeWidth={1}
            />
            <circle
                cx={toX} //
                cy={toY}
                fill="#fff"
                r={3}
                stroke={stroke}
                strokeWidth={1}
            />
        </>
    );
};

export default ConnectionLine;
