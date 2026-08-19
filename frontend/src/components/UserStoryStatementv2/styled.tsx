import { keyframes } from "@emotion/react";
import { styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

const defaultBackgroundAnimation = keyframes`
    0% {
        background-color: ${colors.alpha.black[5]};
    }
    100% {
        background-color: ${colors.alpha.black[10]};
    }
`;

const highlightBackgroundAnimation = keyframes`
    0% {
        background-color: ${colors.highlight.lighter};
    }
    100% {
        background-color: ${colors.highlight.main};
    }
`;

export const StyledMark = styled("mark", {
    shouldForwardProp: (prop) => prop !== "highlight",
})<{ highlight?: boolean }>(({ theme, highlight }) => {
    const borderRadius =
        typeof theme.shape.borderRadius === "number"
            ? theme.shape.borderRadius * 0.5
            : theme.spacing(0.5);
    return {
        padding: theme.spacing(0.25, 0.5),
        margin: 0,
        borderRadius,
        fontWeight: 500,
        fontSize: "inherit",
        lineHeight: "inherit",
        color: highlight ? theme.palette.text.primary : theme.palette.text.secondary,
        animation: highlight
            ? `${highlightBackgroundAnimation} 0.6s ease-in-out`
            : `${defaultBackgroundAnimation} 0.6s ease-in-out`,
        animationIterationCount: 1,
        animationFillMode: "forwards",
        backgroundColor: highlight ? colors.highlight.main : colors.alpha.black[10],
        transition: "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        display: "inline",
        verticalAlign: "baseline",
        "&:hover": {
            boxShadow: highlight ? theme.shadows[1] : "none",
        },
    };
});
