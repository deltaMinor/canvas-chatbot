import React from "react";

import { SaveOutlined } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

export interface AttributeDrawerFooterProps {
    editable?: boolean;
}

const AttributeDrawerFooterComponent: React.FC<AttributeDrawerFooterProps> = ({ editable }) => {
    return (
        <Stack
            direction="row"
            sx={{
                width: "100%",
                p: 1.25,
                backgroundColor: "background.paper",
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <MuiButton
                    size="medium"
                    fullWidth
                    disabled={!editable}
                    variant="contained"
                    type="submit"
                    startIcon={<SaveOutlined fontSize="small" />}
                    sx={{
                        width: "100%",
                        minHeight: 44,
                        borderRadius: 1.75,
                        px: 2,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        boxShadow: (theme) => `0 8px 18px ${theme.colors.primary.main}26`,
                    }}
                >
                    Save Configuration
                </MuiButton>
            </Box>
        </Stack>
    );
};

export default React.memo(AttributeDrawerFooterComponent) as typeof AttributeDrawerFooterComponent;
