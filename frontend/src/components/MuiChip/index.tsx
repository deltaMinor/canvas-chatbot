import React from "react";

import { ChipProps, TooltipProps } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

import { StyledChip } from "./styled";

const getTransformedLabel = (
    label: string | React.ReactNode, //
    isUpperCase?: boolean,
    isSentenceCase?: boolean,
    isAvatar?: boolean
) => {
    if (typeof label !== "string") return label;
    if (!!isUpperCase) {
        return label?.toUpperCase();
    } else if (!!isSentenceCase) {
        return label?.charAt(0).toUpperCase() + label?.slice(1);
    } else if (!!isAvatar) {
        return label
            ?.split(" ")
            ?.map((v) => v?.charAt(0))
            ?.join();
    }
    return label;
};

export interface MuiChipProps extends ChipProps {
    isAvatar?: boolean;
    isSentenceCase?: boolean;
    isUpperCase?: boolean;
    tooltipProps?: Partial<TooltipProps>;
    tooltipTitle?: React.ReactNode;
}

const MuiChipComponent = ({
    isAvatar,
    isSentenceCase,
    isUpperCase, //
    tooltipProps = {},
    tooltipTitle,
    className: props__className = "",
    ...muiChipProps
}: MuiChipProps) => {
    const {
        label: muiChipLabel, //
        style: muiChipStyle,
        sx: muiChipSx,
        ..._muiChipProps
    } = muiChipProps;

    const _label = getTransformedLabel(
        muiChipLabel, //
        isUpperCase,
        isSentenceCase,
        isAvatar
    );

    const isOutlined = muiChipProps.variant === "outlined";

    return (
        <MuiTooltip
            title={tooltipTitle} //
            arrow
            noMaxWidth
            {...tooltipProps}
        >
            <StyledChip
                sx={{
                    ...muiChipSx,
                }}
                className={`rounded ${isOutlined ? "border" : "border-0"} px-2 py-1 ${props__className}`}
                style={{ ...muiChipStyle }}
                label={_label}
                {..._muiChipProps}
            />
        </MuiTooltip>
    );
};

export default React.memo(MuiChipComponent);
