import React from "react";

import { Box, Card } from "@mui/material";

import NodeIcon from "#root/components/NodeIcon";
import DiagramInfoNodeEffects from "#root/effects/DiagramInfoNodeEffects";
import { usePersistentSelectedNode } from "#root/hooks/diagram";
import { DiagramNode } from "#root/interfaces/diagram";

interface InfoNodeIconProps {
    name: string;
    nodeId: string;
    nodeData: DiagramNode["data"];
    isHovered?: boolean;
    pulseToken: number;
    setPulseToken: React.Dispatch<React.SetStateAction<number>>;
}

const InfoNodeIconComponent: React.FC<InfoNodeIconProps> = ({
    name,
    nodeId,
    nodeData,
    isHovered = false,
    pulseToken,
    setPulseToken,
}) => {
    const comparableNodeId = React.useMemo(
        () => String(nodeData?.["originalNodeId"] || nodeId || ""),
        [nodeData, nodeId]
    );
    const isStepSelected = usePersistentSelectedNode({
        comparableNodeId,
        propsId: nodeId,
    });

    const cardClassName = [
        "info-node-icon__card",
        isStepSelected ? "info-node-icon__card--selected" : "",
        !isStepSelected && isHovered ? "info-node-icon__card--hovered" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Box className="info-node-icon">
            <DiagramInfoNodeEffects
                comparableNodeId={comparableNodeId}
                isHovered={isHovered}
                propsId={nodeId}
                overlayOpacity={1}
                propsData={nodeData}
                propsParentId={undefined}
                propsType={undefined}
                setHandlePulseToken={setPulseToken}
            />
            {isStepSelected && (
                <Box className="info-node-icon__pulse info-node-icon__pulse--loop" />
            )}
            {pulseToken > 0 && (
                <Box
                    key={pulseToken}
                    className="info-node-icon__pulse info-node-icon__pulse--single"
                />
            )}
            <Card
                className={`h-full w-full ${cardClassName}`.trim()} //
            >
                <Box className="info-node-icon__content h-full w-full">
                    <NodeIcon
                        alt=""
                        name={name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                        }}
                    />
                </Box>
            </Card>
        </Box>
    );
};

export default React.memo(InfoNodeIconComponent);
