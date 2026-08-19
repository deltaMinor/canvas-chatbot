import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

interface ImageOptionComponentProps {
    deletable?: boolean;
    disabled?: boolean;
    handleClickDelete?: () => Promise<void>;
    imageUrl: string;
    index?: number;
    label?: string;
}

const ImageOptionComponent = ({
    deletable = true,
    disabled = false,
    handleClickDelete,
    imageUrl,
    index = 0,
    label,
}: ImageOptionComponentProps) => {
    return (
        <Box>
            <Stack
                width="100%"
                spacing={1}
                sx={{
                    justifyContent: "center",
                    alignItems: "flex-end",
                }}
            >
                <img
                    style={{ maxWidth: "100%" }} //
                    src={imageUrl || ""}
                    alt={label || `Image ${index}`}
                />
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    {!!label && <Typography>{label}</Typography>}
                </Stack>
            </Stack>
            {!!deletable && (
                <MuiButton //
                    onClick={handleClickDelete}
                    disabled={disabled}
                    startIcon={<DeleteIcon />}
                    color="error"
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                    }}
                />
            )}
        </Box>
    );
};

export default React.memo(ImageOptionComponent);
