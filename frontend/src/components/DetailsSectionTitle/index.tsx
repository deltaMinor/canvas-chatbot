import React from "react";

import { SvgIconComponent } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

interface DetailsSectionTitleProps {
    title: string;
    icon?: SvgIconComponent;
    color?: string;
}

const DetailsSectionTitle = ({
    title, //
    icon: Icon,
    color = "#7c3aed",
}: DetailsSectionTitleProps) => {
    return (
        <Box
            className="mb-1"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            {Icon ? (
                <Box
                    sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `${color}14`,
                        color,
                    }}
                >
                    <Icon sx={{ fontSize: 14 }} />
                </Box>
            ) : null}
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.01em",
                }}
            >
                {title}
            </Typography>
        </Box>
    );
};

export default React.memo(DetailsSectionTitle);
