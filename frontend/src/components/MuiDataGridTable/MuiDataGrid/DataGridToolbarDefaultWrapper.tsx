import React from "react";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { Badge, Box, Divider, Grid, Stack } from "@mui/material";
import { ColumnsPanelTrigger, FilterPanelTrigger, Toolbar, ToolbarButton } from "@mui/x-data-grid";

import MuiButton from "#root/components/MuiButton";
import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import MuiTooltip from "#root/components/MuiTooltip";
import { useMuiDataGridOpenAdvancedToolbar } from "#root/hooks/muiDataGridTable";
import { setMuiDataGridOpenAdvancedToolbar } from "#root/stores/muiDataGridStore";
import { colors } from "#root/theme/PureLightTheme";

import DataGridToolbarQuickFilter from "./DataGridToolbarQuickFilter";
import { StyledDataGridToolbarStack } from "./styled";

interface DataGridToolbarWrapperProps {
    rowCount: number;
    showAdvancedSidebar?: boolean;
    children?: React.ReactNode | React.ReactNode[];
}

const DataGridToolbarDefaultWrapperComponent = ({
    rowCount,
    showAdvancedSidebar,
    children, //
}: DataGridToolbarWrapperProps) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const openAdvancedToolbar = useMuiDataGridOpenAdvancedToolbar();

    return (
        <Toolbar //
            id="GridToolbarContainer"
            style={{ minHeight: "unset" }}
        >
            <StyledDataGridToolbarStack
                id="GridToolbarContainer_Stack"
                className="w-full" //
            >
                <Grid
                    container
                    id="DataGridToolbarDefaultWrapper__Stack"
                    className="w-full" //
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid
                        size="grow"
                        id="DataGridToolbarDefaultWrapper__Stack__Stack"
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-start"
                        spacing={0}
                        className="overflow-x-hidden"
                    >
                        <Stack //
                            direction="row"
                            className="w-fit overflow-x-hidden"
                            width="fit-content"
                            sx={{
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            {children}
                        </Stack>
                    </Grid>
                    <Grid
                        size="auto"
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1}
                    >
                        <Box className="pl-1">
                            <Stack //
                                direction="row"
                                spacing={1}
                                style={{ backgroundColor: "#fff" }}
                            >
                                <MuiTooltip title="Columns">
                                    <ColumnsPanelTrigger render={<ToolbarButton />}>
                                        <ViewColumnIcon fontSize="small" />
                                    </ColumnsPanelTrigger>
                                </MuiTooltip>
                                <MuiTooltip title="Filters">
                                    <FilterPanelTrigger
                                        render={(props, state) => (
                                            <ToolbarButton
                                                {...props}
                                                color="default"
                                            >
                                                <Badge
                                                    badgeContent={state.filterCount}
                                                    color="primary"
                                                    variant="dot"
                                                >
                                                    <FilterListIcon fontSize="small" />
                                                </Badge>
                                            </ToolbarButton>
                                        )}
                                    />
                                </MuiTooltip>
                                <Divider
                                    orientation="vertical"
                                    variant="middle"
                                    flexItem
                                    sx={{ mx: 0.5 }}
                                />
                                <DataGridToolbarQuickFilter />
                                <Box
                                    style={{
                                        backgroundColor: "#f2f5f9",
                                        border: `1px solid ${colors.alpha.black[10]}`,
                                    }}
                                    className="flex min-w-[36px] items-center justify-center rounded px-1"
                                >
                                    {rowCount}
                                </Box>
                                {!!showAdvancedSidebar && (
                                    <MuiButton //
                                        variant="contained"
                                        size="small"
                                        endIcon={
                                            !!openAdvancedToolbar ? (
                                                <ExpandMoreIcon />
                                            ) : (
                                                <ExpandLessIcon />
                                            )
                                        }
                                        onClick={() =>
                                            setMuiDataGridOpenAdvancedToolbar(
                                                !openAdvancedToolbar,
                                                muiDataGridTableInstanceId
                                            )
                                        }
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {!!openAdvancedToolbar ? "Hide Advanced" : "Show Advanced"}
                                    </MuiButton>
                                )}
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </StyledDataGridToolbarStack>
        </Toolbar>
    );
};

export default React.memo(DataGridToolbarDefaultWrapperComponent);
