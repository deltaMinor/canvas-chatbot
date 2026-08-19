import React from "react";

import { InfoOutline, KeyboardArrowDown } from "@mui/icons-material";
import { AccordionProps, Stack, Tooltip, Typography } from "@mui/material";

import { CustomAccordion, StyledAccordionDetails, StyledAccordionSummary } from "./styled";

interface ResourceAccordionProps {
    title: string;
    helperText?: string;
    children: React.ReactNode;
    className?: string;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
    sx?: AccordionProps["sx"];
}

const ResourceAccordion: React.FC<ResourceAccordionProps> = ({
    title,
    helperText,
    children,
    className,
    defaultExpanded,
    expanded,
    onChange,
    sx,
}) => {
    const titleContent = (
        <Stack
            direction="row"
            gap={1}
            alignItems="center"
        >
            <Typography
                sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "text.primary",
                    letterSpacing: "0.01em",
                    textTransform: "none",
                }}
                component="p"
                noWrap
            >
                {title}
            </Typography>
            {helperText && (
                <Tooltip
                    title={helperText}
                    placement="top"
                >
                    <InfoOutline
                        fontSize="small"
                        sx={{ color: "blue" }}
                    />
                </Tooltip>
            )}
        </Stack>
    );

    return (
        <CustomAccordion
            {...(className !== undefined && { className })}
            {...(defaultExpanded !== undefined && { defaultExpanded })}
            {...(expanded !== undefined && { expanded })}
            {...(onChange !== undefined && { onChange })}
            {...(sx !== undefined && { sx })}
        >
            <StyledAccordionSummary
                expandIcon={
                    <KeyboardArrowDown
                        sx={{
                            fontSize: "1.25rem",
                        }}
                    />
                }
            >
                {titleContent}
            </StyledAccordionSummary>
            <StyledAccordionDetails>{children}</StyledAccordionDetails>
        </CustomAccordion>
    );
};

export default React.memo(ResourceAccordion);
