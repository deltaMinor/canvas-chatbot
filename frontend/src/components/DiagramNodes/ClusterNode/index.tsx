import React from "react";

import { Box } from "@mui/material";
import { NodeProps } from "@xyflow/react";

import DiagramClusterNodeEffects from "#root/effects/DiagramClusterNodeEffects";
import { useIsThreatScenarioCanvas } from "#root/hooks/diagram";
import { DiagramComponentType, DiagramNode } from "#root/interfaces/diagram";

import ClusterNodeAttackHandles from "./ClusterNodeAttackHandles";
import ClusterNodeHandles from "./ClusterNodeHandles";
import ClusterNodeIconStack from "./ClusterNodeIconStack";

const ClusterNodeComponent = (props: NodeProps<DiagramNode>) => {
    // Selectors and feature state
    const isThreatScenarioCanvas = useIsThreatScenarioCanvas();
    const comparableNodeId = React.useMemo(
        () => String(props.data?.["originalNodeId"] || props.id || ""),
        [props.data, props.id]
    );

    // Local interaction state
    const hoveredHandleCountRef = React.useRef<number>(0);
    const [isHandleHovered, setIsHandleHovered] = React.useState<boolean>(false);
    const [pulseToken, setPulseToken] = React.useState<number>(0);

    // Canvas and selection behaviour
    const disableHandles = props?.data?.["disableHandles"] === true;
    const attackHandleOpacity = React.useMemo(
        () => (disableHandles ? 0 : isThreatScenarioCanvas ? 1 : 0),
        [disableHandles, isThreatScenarioCanvas]
    );
    const shouldPreventCanvasPan = props.draggable !== false;
    const overlayOpacityValue = props?.data?.["overlayOpacity"];
    const overlayOpacity = typeof overlayOpacityValue === "number" ? overlayOpacityValue : 1;

    // Event handlers
    const handleHandleHover = React.useCallback((hovered: boolean) => {
        if (hovered) {
            hoveredHandleCountRef.current += 1;
            setPulseToken((value) => value + 1);
        } else {
            hoveredHandleCountRef.current = Math.max(0, hoveredHandleCountRef.current - 1);
        }
        setIsHandleHovered(hoveredHandleCountRef.current > 0);
    }, []);

    return (
        <Box //
            id="ClusterNodeComponent"
            className={[
                "cluster-node-component",
                shouldPreventCanvasPan ? "nopan" : "",
                "relative",
                "h-full",
            ]
                .filter(Boolean)
                .join(" ")}
            sx={{
                opacity: overlayOpacity,
            }}
        >
            <DiagramClusterNodeEffects
                comparableNodeId={comparableNodeId}
                propsId={props.id}
                overlayOpacity={overlayOpacity}
                propsData={props.data}
                propsParentId={props.parentId}
                propsType={props.type}
                setHandlePulseToken={setPulseToken}
            />
            {/* Selection pulse overlay */}
            {pulseToken > 0 && (
                <Box
                    key={pulseToken}
                    className="cluster-node-component__pulse cluster-node-component__pulse--single"
                />
            )}
            {/* Cluster content */}
            <ClusterNodeIconStack //
                comparableNodeId={comparableNodeId}
                propsId={props.id}
                hostedInGCC={!!props?.data?.hostedInGCC}
                icon_position={props?.data?.icon_position || ""}
                icon={props?.data?.icon || ""}
                label={props?.data?.label || ""}
                physicalLocation={props?.data?.physicalLocation ?? ""}
                isHandleHovered={isHandleHovered}
            />
            {/* Regular connection handles */}
            <ClusterNodeHandles //
                dataType={DiagramComponentType.custom.toString()}
                isConnectable={!!props.isConnectable}
                onHandleHover={handleHandleHover}
            />
            {/* Attack-path handles */}
            <ClusterNodeAttackHandles //
                nodeId={props.id}
                opacity={attackHandleOpacity}
                dataType={DiagramComponentType.custom.toString()}
                onHandleHover={handleHandleHover}
            />
        </Box>
    );
};

export default React.memo(ClusterNodeComponent);
