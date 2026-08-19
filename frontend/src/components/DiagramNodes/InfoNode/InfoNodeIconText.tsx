import React from "react";

import { Stack, Typography } from "@mui/material";
import { useReactFlow } from "@xyflow/react";

import MuiTooltip from "#root/components/MuiTooltip";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";

interface InfoNodeIconTextProps {
    id: string;
    label: string;
}

const InfoNodeIconTextComponent = ({
    id, //
    label,
}: InfoNodeIconTextProps) => {
    const reactFlow = useReactFlow<DiagramNode, DiagramEdge>();
    const { getNode } = reactFlow;
    const style = getNode(id)?.style;
    return (
        <Stack //
            id="InfoNodeIconTextComponent"
            className="w-fit max-w-[150%]"
        >
            <MuiTooltip
                title={label}
                placement="top"
                arrow
            >
                <Typography
                    className="overflow-hidden text-ellipsis whitespace-nowrap" //
                    style={{ fontSize: style?.fontSize }}
                >
                    {label}
                </Typography>
            </MuiTooltip>
        </Stack>
    );
};

export default React.memo(InfoNodeIconTextComponent);
