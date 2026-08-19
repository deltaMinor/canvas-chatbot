import React from "react";

import { Box, CircularProgress } from "@mui/material";

const PREVIEW_BOX_HEIGHT = 200;

interface DiagramTopologyPreviewImageProps {
    status: "loading" | "ready" | "error";
    imageUrl?: string | undefined;
}

const DiagramTopologyPreviewImage = ({ status, imageUrl }: DiagramTopologyPreviewImageProps) => {
    // If generation failed, fall back to just the text/buttons below —
    // the preview is a convenience, not a requirement to confirm.
    if (status === "error") return null;

    return (
        <Box
            sx={{
                width: "100%",
                height: PREVIEW_BOX_HEIGHT,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {status === "loading" || !imageUrl ? (
                <CircularProgress size={28} />
            ) : (
                <img
                    src={imageUrl}
                    alt="Preview of the generated diagram"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            )}
        </Box>
    );
};

export type { DiagramTopologyPreviewImageProps };
export default React.memo(DiagramTopologyPreviewImage);
