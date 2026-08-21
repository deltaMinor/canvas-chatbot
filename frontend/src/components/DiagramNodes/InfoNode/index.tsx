import React from "react";

import { Box } from "@mui/material";
import { NodeProps } from "@xyflow/react";

import { INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM } from "#root/constants/diagramConfig";
import { useInfoNodeDataStored } from "#root/hooks/diagram";
import { DiagramComponentType, DiagramNode } from "#root/interfaces/diagram";

import InfoNodeAttackHandles from "./InfoNodeAttackHandles";
import InfoNodeBadgeBox from "./InfoNodeBadgeBox";
import InfoNodeHandles from "./InfoNodeHandles";
import InfoNodeIcon from "./InfoNodeIcon";
import InfoNodeIconText from "./InfoNodeIconText";
import InfoNodeMainShell from "./InfoNodeMainShell";

interface InfoNodeProps extends NodeProps<DiagramNode> {}

const InfoNodeComponent = (props: InfoNodeProps) => {
    // Local interaction state
    const hoveredHandleCountRef = React.useRef<number>(0);
    const [isHandleHovered, setIsHandleHovered] = React.useState<boolean>(false);
    const [pulseToken, setPulseToken] = React.useState<number>(0);

    // Canvas and handle behaviour
    const disableHandles = props?.data?.["disableHandles"] === true;
    // Get data stored information
    const nodeData = props?.data;
    const nodeDataStored = nodeData?.["data_stored"];

    const dataStored = useInfoNodeDataStored(nodeDataStored);

    const showDataStoredIcon = React.useMemo(
        () => !!dataStored && dataStored.count > 0,
        [dataStored]
    );

    const handleHandleHover = React.useCallback((hovered: boolean) => {
        if (hovered) {
            hoveredHandleCountRef.current += 1;
        } else {
            hoveredHandleCountRef.current = Math.max(0, hoveredHandleCountRef.current - 1);
        }
        setIsHandleHovered(hoveredHandleCountRef.current > 0);
    }, []);

    return (
        <Box
            id="InfoNodeComponent"
            className="info-node-component relative h-full"
        >
            {/* Main node shell */}
            <InfoNodeMainShell
                data={props.data}
                draggable={props.draggable}
                selected={props.selected}
            >
                {/* Secondary badges */}
                {!!showDataStoredIcon && dataStored && (
                    <InfoNodeBadgeBox
                        count={dataStored.count}
                        labels={dataStored.labels}
                    />
                )}
                <Box className="info-node-shell__icon-slot">
                    <InfoNodeIcon //
                        name={props?.data?.["icon"] || ""}
                        nodeId={props.id}
                        nodeData={props.data}
                        isHovered={isHandleHovered}
                        pulseToken={pulseToken}
                        setPulseToken={setPulseToken}
                    />
                </Box>
                <Box
                    id="infonode-text-block-container"
                    className="info-node-shell__text-block"
                    style={{ bottom: INFO_NODE_TEXT_BLOCK_CONTAINER_OFFSET_BTM }}
                >
                    <InfoNodeIconText //
                        id={props.id}
                        label={props?.data?.["label"] || ""}
                    />
                </Box>
            </InfoNodeMainShell>
            {/* Connection handles */}
            <InfoNodeAttackHandles //
                nodeId={props.id}
                dataType={DiagramComponentType.custom.toString()}
                disableHandles={disableHandles}
                hasBadgeBox={!!showDataStoredIcon && !!dataStored}
                onHandleHover={handleHandleHover}
            />
            <InfoNodeHandles //
                dataType={props?.data?.["type"] || ""}
                isConnectable={!!props?.isConnectable}
                hasBadgeBox={!!showDataStoredIcon && !!dataStored}
                onHandleHover={handleHandleHover}
            />
        </Box>
    );
};

export default React.memo(InfoNodeComponent);
