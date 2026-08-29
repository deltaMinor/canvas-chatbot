import React from "react";

import { AppBar, Box, Chip, Grid, Stack, Typography } from "@mui/material";

import { useProject, useProjectId } from "#root/hooks/backendHooks";

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
                                <Stack
                                    direction="row"
                                    sx={{
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                    }}
                                    spacing={1}
                                >
                                    <ImportButton />
                                    <ExportButton />
                                    <ClearButton />
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </AppBar>
        </Box>
    );
};

export default React.memo(HeaderBodyComponent);
