import React from "react";

import { CircularProgress, Collapse, Stack } from "@mui/material";
import {
    DataGridProps,
    GridCallbackDetails,
    GridColDef,
    GridColumnResizeParams,
    GridColumnVisibilityModel,
    GridEventListener,
    GridLoadingOverlayVariant,
    GridRowParams,
    GridRowSelectionModel,
    GridState,
    GridValidRowModel,
    MuiEvent,
} from "@mui/x-data-grid";

import {
    useMuiDataGridOpenAdvancedToolbar,
    useResizeMuiDataGridColumns,
} from "#root/hooks/muiDataGridTable";
import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";

import DataGridAdvancedToolbar from "./DataGridAdvancedToolbar";
import DataGridToolbar from "./DataGridToolbar";
import { DEFAULT_AUTOSIZE_OPTIONS, DEFAULT_PAGE_SIZE_OPTIONS } from "./constants";
import { StyledDataGrid } from "./styled";

interface MuiDataGridTableProps {
    loading?: boolean;
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    columns: GridColDef<GridValidRowModel>[];
    rows: GridValidRowModel[];
    SlotToolbarDefaultComponents?: React.FC | undefined;
    SlotToolbarSelectedComponents?:
        | React.FC<{
              rowSelectionModel: GridRowSelectionModel;
          }>
        | undefined;
    SlotToolbarAdvancedComponents?: React.FC | undefined;
    handleRowDoubleClick?: GridEventListener<"rowDoubleClick">;
    handleStateChange?: GridEventListener<"stateChange">;
    handleRowSelectionModelChange?: (
        model: GridRowSelectionModel, //
        details: GridCallbackDetails
    ) => void;
    handleColumnVisibilityModelChange?: (
        model: GridColumnVisibilityModel, //
        details: GridCallbackDetails
    ) => void;
    //
    dataGridProps?: Partial<DataGridProps>;
}

const MuiDataGridTableComponent = ({
    loading,
    apiRef,
    columns,
    rows,
    SlotToolbarAdvancedComponents,
    SlotToolbarDefaultComponents,
    SlotToolbarSelectedComponents,
    handleColumnVisibilityModelChange = () => {},
    handleRowDoubleClick = () => {},
    handleRowSelectionModelChange = () => {},
    handleStateChange = () => {},
    dataGridProps = {},
}: MuiDataGridTableProps) => {
    const loading__table = !!loading || columns.length === 0;
    const openAdvancedToolbar = useMuiDataGridOpenAdvancedToolbar();
    const resizeColumns = useResizeMuiDataGridColumns({ apiRef });

    const {
        slotProps: dataGrid__slotProps = {}, //
        slots: dataGrid__slots = {}, //
        autosizeOptions: dataGrid__autosizeOptions = {},
        ..._dataGridProps
    } = dataGridProps;

    const getSlotProps = React.useCallback(() => {
        const {
            toolbar: slotPropsToolbar = {}, //
            loadingOverlay: slotPropsLoadingOverlay = {}, //
            ..._slotProps
        } = dataGrid__slotProps;

        return {
            toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
                ...slotPropsToolbar,
            },
            loadingOverlay: {
                variant: "linear-progress" as GridLoadingOverlayVariant,
                // noRowsVariant: "linear-progress",
                ...slotPropsLoadingOverlay,
            },
            ..._slotProps,
        };
    }, [dataGrid__slotProps]);
    const _slotProps = React.useMemo(
        () => getSlotProps(), //
        [getSlotProps]
    );

    const showAdvancedSidebar = React.useMemo(
        () => !!SlotToolbarAdvancedComponents, //
        [SlotToolbarAdvancedComponents]
    );

    const rowCount = rows?.length || 0;
    const hasFlexColumns = React.useMemo(
        () => columns?.some((c: GridColDef) => !!c?.flex),
        [columns]
    );
    const ToolbarComponent = React.useCallback(() => {
        return (
            <DataGridToolbar
                apiRef={apiRef}
                rowCount={rowCount}
                SlotToolbarDefaultComponents={SlotToolbarDefaultComponents || (() => null)}
                SlotToolbarSelectedComponents={SlotToolbarSelectedComponents || (() => null)}
                showAdvancedSidebar={showAdvancedSidebar}
            />
        );
    }, [
        apiRef,
        rowCount,
        showAdvancedSidebar,
        SlotToolbarDefaultComponents, //
        SlotToolbarSelectedComponents,
    ]);

    const _autosizeOptions = React.useMemo(() => {
        const autosizeColumns =
            columns
                ?.filter((c: GridColDef) => {
                    return !c?.flex;
                })
                ?.map((c: GridColDef) => c.field) || [];
        return {
            ...DEFAULT_AUTOSIZE_OPTIONS,
            ...(dataGrid__autosizeOptions?.expand === undefined && {
                expand: !hasFlexColumns,
            }),
            columns: autosizeColumns,
            ...dataGrid__autosizeOptions, //
        };
    }, [columns, dataGrid__autosizeOptions, hasFlexColumns]);

    const onColumnVisibilityModelChange = React.useCallback(
        async (
            model: GridColumnVisibilityModel, //
            details: GridCallbackDetails
        ) => {
            if (!hasFlexColumns) {
                resizeColumns();
            }
            handleColumnVisibilityModelChange(model, details);
        },
        [handleColumnVisibilityModelChange, hasFlexColumns, resizeColumns]
    );

    const onColumnWidthChange = React.useCallback(
        async (
            _params: GridColumnResizeParams,
            _event: MuiEvent<object | MouseEvent>, //
            _details: GridCallbackDetails
        ) => {},
        []
    );

    const onRowDoubleClick = React.useCallback(
        async (
            params: GridRowParams, //
            event: MuiEvent<React.MouseEvent<HTMLElement>>,
            details: GridCallbackDetails
        ) => {
            handleRowDoubleClick(
                params, //
                event,
                details
            );
        },
        [handleRowDoubleClick]
    );

    const onRowSelectionModelChange = React.useCallback(
        async (
            model: GridRowSelectionModel, //
            details: GridCallbackDetails
        ) => {
            handleRowSelectionModelChange(model, details);
        },
        [handleRowSelectionModelChange]
    );

    const onRowCountChange = React.useCallback(
        async (
            _count: number //
        ) => {
            if (!hasFlexColumns) {
                resizeColumns();
            }
        },
        [hasFlexColumns, resizeColumns]
    );

    const onStateChange = React.useCallback(
        async (
            state: GridState, //
            event: MuiEvent,
            details: GridCallbackDetails
        ) => {
            handleStateChange(
                state, //
                event,
                details
            );
        },
        [handleStateChange]
    );

    // initialState sorting does not working with async columns
    // workaround to defer rendering the table before the columns are ready
    if (loading__table) return <CircularProgress size={20} />;

    return (
        <Stack
            direction="column"
            className="w-full"
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {!!SlotToolbarAdvancedComponents && (
                <Collapse
                    in={!!openAdvancedToolbar} //
                    collapsedSize={0}
                    orientation="vertical"
                    className="w-full"
                >
                    <DataGridAdvancedToolbar //
                    >
                        <SlotToolbarAdvancedComponents />
                    </DataGridAdvancedToolbar>
                </Collapse>
            )}
            <StyledDataGrid
                loading={loading__table}
                apiRef={apiRef}
                columns={columns || []}
                rows={rows || []}
                onColumnVisibilityModelChange={onColumnVisibilityModelChange}
                onColumnWidthChange={onColumnWidthChange}
                onRowDoubleClick={onRowDoubleClick}
                onRowSelectionModelChange={onRowSelectionModelChange}
                onStateChange={onStateChange}
                onRowCountChange={onRowCountChange}
                //
                disableRowSelectionOnClick
                disableDensitySelector
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                autosizeOptions={_autosizeOptions}
                autosizeOnMount={!hasFlexColumns && !!_autosizeOptions.columns?.length}
                getRowHeight={() => "auto"}
                showToolbar
                slots={{
                    toolbar: !!dataGrid__slots?.toolbar //
                        ? dataGrid__slots.toolbar
                        : ToolbarComponent,
                    // noResultsOverlay: DataGridNoResultsOverlay,
                    // noRowsOverlay: DataGridNoRowsOverlay,
                }}
                slotProps={_slotProps}
                {..._dataGridProps}
            />
        </Stack>
    );
};

export default React.memo(MuiDataGridTableComponent) as typeof MuiDataGridTableComponent;
