import React from "react";

import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { AppBar, Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";

import { DialogStateEnum } from "#root/enums/dialog";
import { useProject, useProjectId } from "#root/hooks/backendHooks";
import { handleOpenDialog } from "#root/stores/dialogStore";

import ClearButton from "./ClearButton";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || "Integrative Threat Modelling Platform";

const HeaderBodyComponent = () => {
    const project = useProject();
    const projectId = useProjectId();
    const projectName = React.useMemo(() => {
        if (!projectId) return "";
        return `${project?.project_name || ""}`;
    }, [project?.project_name, projectId]);

    const handleClickImport = React.useCallback(() => {
        handleOpenDialog(DialogStateEnum.diagramSetup);
    }, []);

    return (
        <Box>
            <AppBar
                id="mui-navbar-appbar" //
                position="static"
                color="primary"
                component="nav"
            >
                <Grid
                    className="relative m-auto h-full w-full" //
                    container
                    direction="row"
                >
                    <Grid size="grow">
                        <Box //
                            className="h-full px-1"
                        >
                            <Stack //
                                direction="row"
                                sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                className="h-full"
                                spacing={1}
                            >
                                <Stack
                                    direction="row"
                                    sx={{
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                    }}
                                    spacing={1}
                                >
                                    <Typography
                                        variant="h3" //
                                        noWrap
                                        sx={{
                                            color: "#fff",
                                            display: {
                                                xs: "none",
                                                sm: "block",
                                            },
                                        }}
                                    >
                                        {BRAND_NAME}
                                    </Typography>
                                    {!!projectName && (
                                        <Chip
                                            label={`${projectName || ""}`.toUpperCase()}
                                            variant="outlined"
                                            style={{ color: "#fff" }}
                                        />
                                    )}
                                </Stack>
                                <ImportButton />
                                <ExportButton />
                                <ClearButton />
                                <Button
                                    onClick={handleClickImport}
                                    startIcon={<FileUploadOutlinedIcon />}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        color: "#fff",
                                        borderColor: "rgba(255, 255, 255, 0.5)",
                                        whiteSpace: "nowrap",
                                        "&:hover": {
                                            borderColor: "#fff",
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                        },
                                    }}
                                >
                                    Import
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </AppBar>
        </Box>
    );
};

export default React.memo(HeaderBodyComponent);
