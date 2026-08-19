import React from "react";

import { Chip } from "@mui/material";

interface ExpressionMetadataProps {
    setContext?: string | undefined;
    returnObjectAttribute?: string | undefined;
}

const ExpressionMetadata: React.FC<ExpressionMetadataProps> = ({
    setContext,
    returnObjectAttribute,
}) => {
    return (
        <>
            {setContext && (
                <Chip
                    label={`Context: ${setContext}`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        mb: 0.5,
                    }}
                />
            )}
            {returnObjectAttribute && (
                <Chip
                    label={`Returns: ${returnObjectAttribute}`}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        mb: 0.5,
                        color: "success.main",
                        borderColor: "success.main",
                    }}
                />
            )}
        </>
    );
};

export default React.memo(ExpressionMetadata);
