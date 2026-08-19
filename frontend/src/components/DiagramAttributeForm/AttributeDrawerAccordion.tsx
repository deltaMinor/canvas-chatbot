import React from "react";

import { InfoOutline, KeyboardArrowDown } from "@mui/icons-material";
import { AccordionProps, Box, Stack, Tooltip, Typography } from "@mui/material";

import {
    AttributeDrawerAccordionDetails,
    AttributeDrawerAccordionRoot,
    AttributeDrawerAccordionSummary,
} from "./styled";

export interface AttributeDrawerAccordionProps {
    title: string;
    helperText?: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
    sx?: AccordionProps["sx"];
}

const AttributeDrawerAccordionComponent = ({
    title,
    helperText,
    children,
    defaultExpanded,
    expanded,
    onChange,
    sx,
}: AttributeDrawerAccordionProps) => {
    return (
        <AttributeDrawerAccordionRoot
            {...(defaultExpanded !== undefined ? { defaultExpanded } : {})}
            {...(expanded !== undefined ? { expanded } : {})}
            {...(onChange !== undefined ? { onChange } : {})}
            {...(sx !== undefined ? { sx } : {})}
        >
            <AttributeDrawerAccordionSummary
                expandIcon={
                    <KeyboardArrowDown
                        sx={{
                            fontSize: "1.2rem",
                        }}
                    />
                }
            >
                <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                >
                    <Box
                        className="AttributeDrawerAccordion-dot"
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        component="p"
                        noWrap
                        sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "text.primary",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                        }}
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
                                sx={{ color: "primary.main", fontSize: "0.95rem" }}
                            />
                        </Tooltip>
                    )}
                </Stack>
            </AttributeDrawerAccordionSummary>
            <AttributeDrawerAccordionDetails>{children}</AttributeDrawerAccordionDetails>
        </AttributeDrawerAccordionRoot>
    );
};

export default React.memo(
    AttributeDrawerAccordionComponent
) as typeof AttributeDrawerAccordionComponent;
