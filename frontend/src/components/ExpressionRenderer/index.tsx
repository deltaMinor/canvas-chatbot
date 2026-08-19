import React from "react";

import { Box } from "@mui/material";

import { AttackFlowExpression } from "#root/interfaces/attack_flow";

import ExpressionChips from "./ExpressionChips";
import ExpressionHeader from "./ExpressionHeader";
import ExpressionMetadata from "./ExpressionMetadata";
import ExpressionParameters from "./ExpressionParameters";
import ExpressionSetAttributes from "./ExpressionSetAttributes";

interface ExpressionRendererProps {
    expr: AttackFlowExpression;
    depth?: number;
}

type ExpressionRendererComponent = React.NamedExoticComponent<ExpressionRendererProps> & {
    Chips: typeof ExpressionChips;
    Header: typeof ExpressionHeader;
    Metadata: typeof ExpressionMetadata;
    Parameters: typeof ExpressionParameters;
    SetAttributes: typeof ExpressionSetAttributes;
};

const ExpressionRendererRoot: React.FC<ExpressionRendererProps> = ({ expr, depth = 0 }) => {
    if (!expr) return null;

    return (
        <Box
            key={JSON.stringify(expr)}
            sx={{
                pl: depth * 2,
                mb: 1,
                borderLeft: depth > 0 ? "2px solid" : "none",
                borderColor: depth > 0 ? "primary.light" : "transparent",
                borderRadius: "0 4px 4px 0",
            }}
        >
            <ExpressionRenderer.Header
                attribute={expr.attribute}
                expression={expr.expression}
            />

            <ExpressionRenderer.Chips
                expression={expr.expression}
                parameterType={expr.parameter_type}
            />

            <ExpressionRenderer.Metadata
                setContext={expr.set_context}
                returnObjectAttribute={expr.return_object_attribute}
            />

            {expr.parameters != null && (
                <Box sx={{ mt: 1 }}>
                    <ExpressionRenderer.Parameters
                        parameters={expr.parameters}
                        depth={depth}
                        renderExpression={(expr, depth) => (
                            <ExpressionRenderer
                                expr={expr}
                                depth={depth}
                            />
                        )}
                    />
                </Box>
            )}

            <ExpressionRenderer.SetAttributes setAttribute={expr.set_attribute} />
        </Box>
    );
};

const ExpressionRenderer = React.memo(ExpressionRendererRoot) as ExpressionRendererComponent;

ExpressionRenderer.Chips = ExpressionChips;
ExpressionRenderer.Header = ExpressionHeader;
ExpressionRenderer.Metadata = ExpressionMetadata;
ExpressionRenderer.Parameters = ExpressionParameters;
ExpressionRenderer.SetAttributes = ExpressionSetAttributes;

export default ExpressionRenderer;
