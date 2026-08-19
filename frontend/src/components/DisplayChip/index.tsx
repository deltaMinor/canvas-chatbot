import React from "react";

import { Stack } from "@mui/material";
import { Property } from "csstype";

import MuiChip, { type MuiChipProps } from "#root/components/MuiChip";
import MuiTooltip from "#root/components/MuiTooltip";

import { DisplayChipVariant } from "./constants";
import { getChipStyle } from "./helper";

const backgroundColorDefault = "#22335410";
const borderColorDefault = "#fff";
const colorDefault = "#223354";

interface DisplayChipProps {
    value?: string[] | string | number | null;
    labelMapping?: { [key: string]: string };
    backgroundColorMapping?: { [key: string]: string };
    colorMapping?: { [key: string]: string };
    chipProps?: MuiChipProps;
    variant?: "default" | "outlined";
    justifyContent?: Property.JustifyContent;
    alignItems?: Property.AlignItems;
    defaultLabel?: string;
    maxChipWidth?: number;
    maxChipCount?: number;
}

const DisplayChipComponent = ({
    value, //
    labelMapping = {},
    backgroundColorMapping = {},
    colorMapping = {},
    chipProps = {},
    variant = DisplayChipVariant.default,
    justifyContent = "center",
    alignItems = "center",
    defaultLabel = "",
    maxChipCount,
}: DisplayChipProps) => {
    const {
        style: muiChipStyle, //
        ..._chipProps
    } = chipProps;
    const valueList = (Array.isArray(value) ? value : value || value === 0 ? [value] : [])
        .map((v) => `${v ?? ""}`)
        .filter(Boolean);
    const _value =
        maxChipCount === undefined //
            ? valueList
            : valueList.slice(0, maxChipCount);
    const excessChipValue = valueList.slice(maxChipCount) || [];
    const combinedExcessChipTitle = excessChipValue
        ?.map((key) => {
            return (
                labelMapping?.[key as keyof typeof labelMapping] || //
                defaultLabel ||
                key
            );
        })
        ?.join(",\n");
    return (
        <Stack
            id="DisplayChipComponent" //
            direction="row"
            className="h-full w-full"
            sx={{
                justifyContent,
                alignItems,
            }}
            spacing={0.5}
        >
            {_value?.map((key: string, index) => {
                const label =
                    labelMapping?.[key as keyof typeof labelMapping] || //
                    defaultLabel ||
                    key; //
                const chipStyle = getChipStyle({
                    key, //
                    variant,
                    backgroundColorMapping,
                    colorMapping,
                    backgroundColorDefault,
                    colorDefault,
                    borderColorDefault,
                });
                return (
                    <MuiTooltip
                        key={`${key || "empty"}-${index}`} //
                        title={label}
                        noMaxWidth
                    >
                        <div>
                            <MuiChip
                                style={{
                                    ...chipStyle,
                                    ...muiChipStyle,
                                }}
                                label={label}
                                {..._chipProps}
                            />
                        </div>
                    </MuiTooltip>
                );
            })}
            {!!maxChipCount && valueList.length > maxChipCount && (
                <MuiTooltip //
                    title={combinedExcessChipTitle}
                    noMaxWidth
                >
                    <div>
                        <MuiChip
                            style={{
                                ...muiChipStyle, //
                            }}
                            label={`+${excessChipValue?.length}`}
                            {..._chipProps}
                        />
                    </div>
                </MuiTooltip>
            )}
        </Stack>
    );
};

export default React.memo(DisplayChipComponent);
