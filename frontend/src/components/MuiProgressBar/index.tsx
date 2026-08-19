import React from "react";

import { Box } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";

import MuiTooltip from "#root/components/MuiTooltip";

import OdometerPercentage from "./OdometerPercentage";

const progressBarSheen = keyframes`
    0% {
        transform: translateX(-120%);
    }
    100% {
        transform: translateX(240%);
    }
`;

interface MuiProgressBarProps {
    value: number;
    animated?: boolean;
    disabled?: boolean;
    hidePercentageText?: boolean;
    minDisplayValue?: number;
}

const MuiProgressBarComponent = ({
    animated = true,
    disabled = false,
    hidePercentageText = false,
    minDisplayValue = 1,
    value,
}: MuiProgressBarProps) => {
    const normalizedValue = Math.min(Math.max(value ?? 0, 0), 100);
    const displayValue = normalizedValue <= 0 ? minDisplayValue : normalizedValue;
    const odometerValue = Math.min(99, Math.round(normalizedValue));
    const displayText = `${String(odometerValue).padStart(2, "0")}%`;

    return (
        <Box
            sx={{
                alignItems: "center",
                display: "flex",
                gap: 1,
                minWidth: hidePercentageText ? 120 : 180,
                width: "100%",
            }}
        >
            <MuiTooltip
                title={displayText}
                arrow
            >
                <Box
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={normalizedValue}
                    sx={(theme) => ({
                        bgcolor: alpha(
                            disabled ? theme.palette.text.primary : theme.palette.primary.main,
                            disabled ? 0.12 : 0.18
                        ),
                        borderRadius: 999,
                        height: 10,
                        minWidth: 0,
                        overflow: "hidden",
                        width: "100%",
                    })}
                >
                    <Box
                        sx={(theme) => ({
                            backgroundColor: disabled
                                ? theme.palette.action.disabled
                                : theme.palette.primary.main,
                            borderRadius: 999,
                            height: "100%",
                            overflow: "hidden",
                            position: "relative",
                            transition: theme.transitions.create("width", {
                                duration: theme.transitions.duration.standard,
                                easing: theme.transitions.easing.easeOut,
                            }),
                            width: `${displayValue}%`,
                            ...(animated && !disabled
                                ? {
                                      "&::after": {
                                          animation: `${progressBarSheen} 1s linear infinite`,
                                          background: `linear-gradient(
                                              90deg,
                                              transparent 0%,
                                              ${alpha(theme.palette.common.white, 0.46)} 50%,
                                              transparent 100%
                                          )`,
                                          content: '""',
                                          inset: 0,
                                          position: "absolute",
                                          width: "38%",
                                      },
                                      "@media (prefers-reduced-motion: reduce)": {
                                          "&::after": {
                                              animation: "none",
                                          },
                                      },
                                  }
                                : {}),
                        })}
                    />
                </Box>
            </MuiTooltip>
            {!hidePercentageText && <OdometerPercentage valueText={displayText} />}
        </Box>
    );
};

export default React.memo(MuiProgressBarComponent);
