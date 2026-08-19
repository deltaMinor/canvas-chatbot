import React from "react";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, BoxProps, CardProps, GridProps, IconButton, Stack, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";
import { dashboardLayoutTokens } from "#root/constants/dashboardLayout";

import {
    StyledSectionBody,
    StyledSectionCard,
    StyledSectionContentCard,
    StyledSectionContentCardInner,
    StyledSectionHeaderWrap,
    StyledSectionItem,
    StyledSectionItemInner,
    StyledSectionRoot,
} from "./styled";

interface DashboardSectionRootProps extends BoxProps {}

interface DashboardSectionHeaderProps {
    title: string;
    eyebrow?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    helperText?: string;
}

interface DashboardSectionCardHeaderProps {
    title: string;
    subtitle?: string;
    helperText?: string;
    action?: React.ReactNode;
}

interface DashboardSectionContentCardProps
    extends Omit<CardProps, "title">, DashboardSectionCardHeaderProps {
    children?: React.ReactNode;
    contentClassName?: string;
}

const DashboardSectionRoot = ({ children, sx, ...props }: DashboardSectionRootProps) => {
    if (sx) {
        return (
            <StyledSectionRoot
                sx={sx}
                {...props}
            >
                {children}
            </StyledSectionRoot>
        );
    }

    return <StyledSectionRoot {...props}>{children}</StyledSectionRoot>;
};

const DashboardSectionHeaderContent = ({
    title,
    eyebrow,
    description,
    icon,
    action,
    helperText,
}: DashboardSectionHeaderProps) => {
    const accentColor = "#7c3aed";

    const trailingAction = React.useMemo(() => {
        if (action) return action;
        if (!helperText) return null;

        return (
            <MuiTooltip title={helperText}>
                <IconButton
                    size="small"
                    className="dashboard-section__info-button"
                >
                    <InfoOutlinedIcon className="dashboard-section__info-icon" />
                </IconButton>
            </MuiTooltip>
        );
    }, [action, helperText]);

    return (
        <Stack
            direction="row"
            alignItems={eyebrow || description ? "flex-start" : "center"}
            justifyContent="space-between"
            gap={dashboardLayoutTokens.contentRowGap}
            className="dashboard-section__header"
        >
            <Stack
                direction="column"
                spacing={eyebrow || description ? 0.25 : 0}
            >
                {!!eyebrow && (
                    <Typography
                        variant="overline"
                        className="dashboard-section__eyebrow"
                        sx={{ color: accentColor }}
                    >
                        {eyebrow}
                    </Typography>
                )}
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={dashboardLayoutTokens.contentRowGap}
                >
                    {!!icon && (
                        <Box
                            className="dashboard-section__icon-wrap"
                            sx={{
                                display: eyebrow || description ? "none" : "flex",
                                backgroundColor: `${accentColor}14`,
                                color: accentColor,
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Typography
                        variant={eyebrow || description ? "h5" : "subtitle1"}
                        className={
                            eyebrow || description
                                ? "dashboard-section__title dashboard-section__title--large"
                                : "dashboard-section__title"
                        }
                    >
                        {title}
                    </Typography>
                </Stack>
                {!!description && (
                    <Typography
                        variant="body2"
                        className="dashboard-section__description"
                    >
                        {description}
                    </Typography>
                )}
            </Stack>
            {trailingAction}
        </Stack>
    );
};

interface DashboardSectionHeaderSlotProps extends DashboardSectionHeaderProps {
    sx?: BoxProps["sx"];
}

const DashboardSectionHeaderSlot = ({ sx, ...props }: DashboardSectionHeaderSlotProps) => {
    if (sx) {
        return (
            <StyledSectionHeaderWrap sx={sx}>
                <DashboardSectionHeaderContent {...props} />
            </StyledSectionHeaderWrap>
        );
    }

    return (
        <StyledSectionHeaderWrap>
            <DashboardSectionHeaderContent {...props} />
        </StyledSectionHeaderWrap>
    );
};

interface DashboardSectionBodyProps extends GridProps {}

const DashboardSectionBody = ({
    children,
    columnSpacing = dashboardLayoutTokens.sectionGridColumnSpacing,
    rowSpacing = dashboardLayoutTokens.sectionGridRowSpacing,
    alignItems = "stretch",
    ...props
}: DashboardSectionBodyProps) => {
    return (
        <StyledSectionBody
            container
            columnSpacing={columnSpacing}
            rowSpacing={rowSpacing}
            alignItems={alignItems}
            {...props}
        >
            {children}
        </StyledSectionBody>
    );
};

interface DashboardSectionItemProps extends GridProps {
    pulseActive?: boolean;
}

const DashboardSectionItem = ({
    children,
    className = "",
    pulseActive = false,
    ...props
}: DashboardSectionItemProps) => {
    return (
        <StyledSectionItem
            className={`flex ${className}`.trim()}
            {...props}
        >
            <StyledSectionItemInner pulseActive={pulseActive}>{children}</StyledSectionItemInner>
        </StyledSectionItem>
    );
};

export interface DashboardSectionCardProps extends CardProps {}

const DashboardSectionCard = ({
    children,
    className = "",
    ...props
}: DashboardSectionCardProps) => {
    return (
        <StyledSectionCard
            variant="outlined"
            className={`shadow-none ${className}`.trim()}
            {...props}
        >
            {children}
        </StyledSectionCard>
    );
};

const DashboardSectionCardHeader = ({
    title,
    subtitle,
    helperText,
    action,
}: DashboardSectionCardHeaderProps) => {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={dashboardLayoutTokens.contentRowGap}
            className="dashboard-section-card-header"
        >
            <Stack spacing={0.5}>
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={dashboardLayoutTokens.contentRowGap}
                >
                    <Typography
                        variant="subtitle1"
                        className="dashboard-section-card-header__title"
                    >
                        {title}
                    </Typography>
                    {!!helperText && (
                        <MuiTooltip title={helperText}>
                            <HelpOutlineIcon className="dashboard-section-card-header__help" />
                        </MuiTooltip>
                    )}
                </Stack>
                {!!subtitle && (
                    <Typography
                        variant="body2"
                        className="dashboard-section-card-header__subtitle"
                    >
                        {subtitle}
                    </Typography>
                )}
            </Stack>
            {action}
        </Stack>
    );
};

const DashboardSectionContentCard = ({
    title,
    subtitle,
    helperText,
    action,
    children,
    className = "",
    contentClassName = "",
    ...props
}: DashboardSectionContentCardProps) => {
    return (
        <StyledSectionContentCard
            variant="outlined"
            className={`shadow-none ${className}`.trim()}
            {...props}
        >
            <StyledSectionContentCardInner
                spacing={dashboardLayoutTokens.contentStackSpacing}
                className={contentClassName}
            >
                <DashboardSectionCardHeader
                    title={title}
                    {...(subtitle ? { subtitle } : {})}
                    {...(helperText ? { helperText } : {})}
                    {...(action ? { action } : {})}
                />
                {children}
            </StyledSectionContentCardInner>
        </StyledSectionContentCard>
    );
};

type DashboardSectionCompound = React.FC<DashboardSectionRootProps> & {
    Header: typeof DashboardSectionHeaderSlot;
    Body: typeof DashboardSectionBody;
    Item: typeof DashboardSectionItem;
    Card: typeof DashboardSectionCard;
    CardHeader: typeof DashboardSectionCardHeader;
    ContentCard: typeof DashboardSectionContentCard;
};

const DashboardSectionComponent = DashboardSectionRoot as DashboardSectionCompound;

DashboardSectionComponent.Header = DashboardSectionHeaderSlot;
DashboardSectionComponent.Body = DashboardSectionBody;
DashboardSectionComponent.Item = DashboardSectionItem;
DashboardSectionComponent.Card = DashboardSectionCard;
DashboardSectionComponent.CardHeader = DashboardSectionCardHeader;
DashboardSectionComponent.ContentCard = DashboardSectionContentCard;

export default DashboardSectionComponent;
