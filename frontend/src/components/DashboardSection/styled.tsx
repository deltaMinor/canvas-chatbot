import type { ComponentProps } from "react";

import { Box, Card, Grid, Stack, alpha, keyframes, styled } from "@mui/material";
import { clsx } from "clsx";

const sectionItemPulse = keyframes`
    0% {
        opacity: 0.45;
        box-shadow: 0 0 0 0 rgba(85, 105, 255, 0);
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 0 6px rgba(85, 105, 255, 0.08);
    }
    100% {
        opacity: 0.45;
        box-shadow: 0 0 0 0 rgba(85, 105, 255, 0);
    }
`;

interface StyledSectionItemInnerProps {
    pulseActive?: boolean;
}

type StyledSectionRootProps = ComponentProps<typeof Box>;

export const StyledSectionRoot = ({ className, ...props }: StyledSectionRootProps) => (
    <Box
        className={clsx("components-dashboard-section__styled-section-root", className)}
        {...props}
    />
);

type StyledSectionHeaderWrapProps = ComponentProps<typeof Box>;

export const StyledSectionHeaderWrap = ({ className, ...props }: StyledSectionHeaderWrapProps) => (
    <Box
        className={clsx("components-dashboard-section__styled-section-header-wrap", className)}
        {...props}
    />
);

type StyledSectionBodyProps = ComponentProps<typeof Grid>;

export const StyledSectionBody = ({ className, ...props }: StyledSectionBodyProps) => (
    <Grid
        className={clsx("components-dashboard-section__styled-section-body", className)}
        {...props}
    />
);

type StyledSectionItemProps = ComponentProps<typeof Grid>;

export const StyledSectionItem = ({ className, ...props }: StyledSectionItemProps) => (
    <Grid
        className={clsx("components-dashboard-section__styled-section-item", className)}
        {...props}
    />
);

export const StyledSectionItemInner = styled(Box, {
    shouldForwardProp: (prop) => prop !== "pulseActive",
})<StyledSectionItemInnerProps>(({ pulseActive, theme }) => ({
    width: "100%",
    height: "100%",
    display: "flex",
    position: "relative",
    borderRadius: 22,
    ...(pulseActive
        ? {
              "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: -6,
                  borderRadius: 24,
                  pointerEvents: "none",
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                  animation: `${sectionItemPulse} 1.8s ease-in-out infinite`,
              },
          }
        : {}),
}));

type StyledSectionCardProps = ComponentProps<typeof Card>;

export const StyledSectionCard = ({ className, ...props }: StyledSectionCardProps) => (
    <Card
        className={clsx("components-dashboard-section__styled-section-card", className)}
        {...props}
    />
);

type StyledSectionContentCardProps = ComponentProps<typeof StyledSectionCard>;

export const StyledSectionContentCard = ({
    className,
    ...props
}: StyledSectionContentCardProps) => (
    <StyledSectionCard
        className={clsx("components-dashboard-section__styled-section-content-card", className)}
        {...props}
    />
);

type StyledSectionContentCardInnerProps = ComponentProps<typeof Stack>;

export const StyledSectionContentCardInner = ({
    className,
    ...props
}: StyledSectionContentCardInnerProps) => (
    <Stack
        className={clsx(
            "components-dashboard-section__styled-section-content-card-inner",
            className
        )}
        {...props}
    />
);
