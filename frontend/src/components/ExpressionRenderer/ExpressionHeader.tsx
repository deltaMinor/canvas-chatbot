import React from "react";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Tooltip, Typography } from "@mui/material";

import { EXPRESSION_DESCRIPTIONS } from "#root/constants/expressionRenderer";

interface ExpressionHeaderProps {
    attribute?: string | undefined;
    expression?: string | undefined;
}

const ExpressionHeader: React.FC<ExpressionHeaderProps> = ({ attribute, expression }) => {
    const expressionName = expression || attribute;
    const hasDescription = expressionName && EXPRESSION_DESCRIPTIONS[expressionName];
    const displayName = attribute || expression || "Expression";

    const getExpressionDescription = (name: string): string => {
        return EXPRESSION_DESCRIPTIONS[name] || "Expression evaluation";
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.5,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    display: "block",
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "0.75rem",
                }}
            >
                {displayName}
            </Typography>
            {hasDescription && (
                <Tooltip
                    title={getExpressionDescription(expressionName)}
                    arrow
                >
                    <InfoOutlinedIcon
                        sx={{
                            fontSize: 14,
                            color: "text.secondary",
                            cursor: "help",
                        }}
                    />
                </Tooltip>
            )}
        </Box>
    );
};

export default React.memo(ExpressionHeader);
