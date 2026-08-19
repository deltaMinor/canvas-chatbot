import { keyframes } from "@emotion/react";
import { styled } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

export const defaultStyleAnimation = keyframes`
  0% {
    background-color: ${colors.alpha.black[5]};
  }
  100% {
    background-color: ${colors.alpha.black[10]};
  }
`;

export const highlightStyleAnimation = keyframes`
  0% {
    background-color: ${colors.highlight.lighter};
  }
  100% {
    background-color: ${colors.highlight.main};
  }
`;

export const StyledMark = styled("mark", {
    shouldForwardProp: (prop) => prop !== "highlight",
})<{ highlight?: boolean }>(({ highlight }) => ({
    animation: !!highlight ? `${highlightStyleAnimation} 1s` : `${defaultStyleAnimation} 1s`,
    animationIterationCount: 1,
    backgroundColor: !!highlight //
        ? colors.highlight.main
        : colors.alpha.black[10],
}));
