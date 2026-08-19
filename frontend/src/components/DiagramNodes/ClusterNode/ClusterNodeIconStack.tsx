import React from "react";

import { Box, Chip, Stack, Typography } from "@mui/material";

import NodeIcon from "#root/components/NodeIcon";
import { defaultPhysicalLocationOptions } from "#root/constants/diagramAttributes";
import { useArchitectureNodes, usePersistentSelectedNode } from "#root/hooks/diagram";
import { StackDirection } from "#root/interfaces/diagram";
import { colors } from "#root/theme/PureLightTheme";
import { getClusterNodeStackParams } from "#root/utils/diagram/clusterNodeUtil";

interface ClusterNodeIconStackProps {
    comparableNodeId: string;
    propsId: string;
    hostedInGCC: boolean;
    icon_position: string;
    icon: string;
    label: string;
    physicalLocation: string;
    isHandleHovered?: boolean;
}

const ClusterNodeIconStackComponent = ({
    comparableNodeId,
    propsId,
    hostedInGCC,
    icon_position,
    icon,
    label,
    physicalLocation,
    isHandleHovered = false,
}: ClusterNodeIconStackProps) => {
    const architectureNodes = useArchitectureNodes();
    const isPersistentSelectedNode = usePersistentSelectedNode({
        comparableNodeId,
        propsId: propsId,
    });

    const isStepSelected = !!isPersistentSelectedNode;

    // Display labels
    const physicalLocationLabel =
        architectureNodes?.find((n) => n?.id === physicalLocation)?.data?.label ??
        defaultPhysicalLocationOptions.find((opt) => opt.value === physicalLocation)?.label ??
        "";

    const stackParams = React.useMemo(
        () => getClusterNodeStackParams(icon_position || "top-left"),
        [icon_position]
    );
    const contentClassName = [
        "relative",
        "max-w-full",
        "cluster-node-icon-stack__content",
        isHandleHovered ? "cluster-node-icon-stack__content--hovered" : "",
        isStepSelected ? "cluster-node-icon-stack__content--selected" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const labelClassName = [
        "m-auto",
        "px-1",
        "cluster-node-icon-stack__label",
        isStepSelected ? "cluster-node-icon-stack__label--selected" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Stack
            id="ClusterNode__Stack"
            direction={stackParams.direction as StackDirection} //
            alignItems={stackParams.alignItems}
            justifyContent={stackParams.justifyContent}
            className="ClusterNode_DragHandle h-full w-full cursor-grab"
        >
            <Stack
                id="ClusterNode__Stack__Stack"
                direction={stackParams.direction as StackDirection} //
                alignItems={stackParams.alignItems}
                justifyContent={stackParams.justifyContent}
                className={contentClassName}
            >
                {!!icon && (
                    <Box //
                        className="cluster-node-icon-stack__icon w-[30px]"
                    >
                        <NodeIcon
                            alt=""
                            name={icon}
                        />
                    </Box>
                )}
                <Typography //
                    className={labelClassName}
                >
                    {label}
                </Typography>
                {!!hostedInGCC && (
                    <Chip
                        id="ClusterNodeIconStack__Chip"
                        className="m-auto h-fit" //
                        label="GCC"
                        size="small"
                        sx={{
                            color: "#fff",
                            backgroundColor: colors.alpha.black[100],
                        }}
                        slotProps={{
                            label: {
                                className: "px-0.5 text-[10px]",
                            },
                        }}
                    />
                )}
                {!!physicalLocation && (
                    <Stack
                        direction="row"
                        className="absolute top-[-22.5px] left-0 m-auto w-fit"
                    >
                        <Chip
                            id="ClusterNodeIconStack__PhysicalLocationChip"
                            className="h-fit truncate"
                            label={physicalLocationLabel || "Unassigned"}
                            size="small"
                            sx={{
                                color: "#fff",
                                backgroundColor: colors.alpha.black[100],
                            }}
                            slotProps={{
                                label: {
                                    className: "px-0.5 text-[12px]",
                                },
                            }}
                        />
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};

export default React.memo(ClusterNodeIconStackComponent);
