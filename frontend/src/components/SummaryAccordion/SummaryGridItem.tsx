import React from "react";

import { Grid, Typography } from "@mui/material";

import { StyledValueBox } from "./styled";

export interface SummaryGridItemProps {
    label: string;
    value?: string | React.ReactNode;
    children?: React.ReactNode;
}

const SummaryGridItemComponent: React.FC<SummaryGridItemProps> = ({ label, value, children }) => {
    return (
        <Grid
            size={12}
            sx={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
            }}
        >
            <Typography
                component="label"
                sx={{
                    display: "block",
                    marginBottom: 0.75,
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                }}
            >
                {label}
            </Typography>
            <StyledValueBox>
                {!!value && (
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            color: "text.primary",
                            lineHeight: 1.5,
                        }}
                    >
                        {value}
                    </Typography>
                )}
                {!!children && children}
            </StyledValueBox>
        </Grid>
    );
};

export default React.memo(SummaryGridItemComponent);
