import React from "react";

import { Box, Chip } from "@mui/material";

import { AttackFlowExpression } from "#root/interfaces/attack_flow";

interface ExpressionParametersProps {
    parameters: unknown;
    depth: number;
    renderExpression?: (expr: AttackFlowExpression, depth: number) => React.ReactNode;
}

const ExpressionParameters: React.FC<ExpressionParametersProps> = ({
    parameters,
    depth,
    renderExpression,
}) => {
    if (!parameters) return null;

    if (Array.isArray(parameters)) {
        return (
            <>
                {parameters.map((param: unknown, idx: number) => {
                    if (typeof param === "object" && param !== null && renderExpression) {
                        return (
                            <Box
                                key={idx}
                                sx={{ mt: 1 }}
                            >
                                {renderExpression(param as AttackFlowExpression, depth + 1)}
                            </Box>
                        );
                    }
                    return (
                        <Chip
                            key={idx}
                            label={String(param)}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: "0.65rem",
                                height: 20,
                                mr: 0.5,
                                mb: 0.5,
                            }}
                        />
                    );
                })}
            </>
        );
    }

    return (
        <Chip
            label={String(parameters)}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.65rem", height: 20 }}
        />
    );
};

export default React.memo(ExpressionParameters);
