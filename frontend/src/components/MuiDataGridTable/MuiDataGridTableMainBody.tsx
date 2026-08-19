import React from "react";

import { Alert } from "@mui/material";
import {
    DataGridProps,
    GridCallbackDetails,
    GridColumnVisibilityModel,
    GridRowParams,
    GridRowSelectionModel,
    MuiEvent,
} from "@mui/x-data-grid";

import {
    useMuiDataGridColumnVisibilityModel,
    useMuiDataGridColumnsState,
    useMuiDataGridFilteredRows,
    useMuiDataGridResolvedCallback,
} from "#root/hooks/muiDataGridTable";
import {
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableGetSelectedToolbarComponentsProps,
    MuiDataGridTableGetToolbarComponentsProps,
    MuiDataGridTableHandleRowDoubleClickProps,
    MuiDataGridTableHandleUpdateFilterButtonStateProps,
    MuiDataGridTableRefObject,
    MuiDataGridTableUseFilteredRows,
    MuiDataGridTableUseSelectedToolbarComponents,
    MuiDataGridTableUseToolbarComponents,
} from "#root/interfaces/muiDataGridTable";
import {
    setMuiDataGridColumnVisibilityModel,
    setMuiDataGridRowSelectionModel,
    setMuiDataGridSelectedRow,
    setMuiDataGridSelectedRowId,
} from "#root/stores/muiDataGridStore";

import { getMuiDataGridInitialState } from "#root/utils/muiDataGridTableUtils";
import MuiDataGrid from "./MuiDataGrid";
import { useMuiDataGridTableInstanceId } from "./contexts/MuiDataGridTableInstanceContext";

interface MuiDataGridTableMainBodyProps {
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    dataGridProps?: Partial<Omit<DataGridProps, "columns" | "rows">>;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useAdvancedToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    useFilteredRows: MuiDataGridTableUseFilteredRows;
    useSelectedToolbarComponents?: MuiDataGridTableUseSelectedToolbarComponents;
    useToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    handleRowDoubleClick?: (props: MuiDataGridTableHandleRowDoubleClickProps) => Promise<void>;
    handleUpdateFilterButtonStateOnModelChange?: (
        props: MuiDataGridTableHandleUpdateFilterButtonStateProps
    ) => Promise<void>;
    loading?: boolean;
    noRowAlertMessage?: string;
}

const MuiDataGridTableMainBody = ({
    apiRef,
    dataGridProps = {},
    getRowIdFromRow,
    useAdvancedToolbarComponents,
    useFilteredRows,
    useSelectedToolbarComponents,
    useToolbarComponents,
    handleRowDoubleClick: props__handleRowDoubleClick = async () => {},
    handleUpdateFilterButtonStateOnModelChange = async () => {},
    loading,
    noRowAlertMessage,
}: MuiDataGridTableMainBodyProps) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const renderToolbarComponents = useMuiDataGridResolvedCallback<
        MuiDataGridTableGetToolbarComponentsProps,
        React.ReactElement
    >(useToolbarComponents);
    const renderSelectedToolbarComponents = useMuiDataGridResolvedCallback<
        MuiDataGridTableGetSelectedToolbarComponentsProps,
        React.ReactElement
    >(useSelectedToolbarComponents);
    const renderAdvancedToolbarComponents = useMuiDataGridResolvedCallback<
        MuiDataGridTableGetToolbarComponentsProps,
        React.ReactElement
    >(useAdvancedToolbarComponents);

    const columns = useMuiDataGridColumnsState();
    const columnVisibilityModel = useMuiDataGridColumnVisibilityModel();
    const filteredRows = useMuiDataGridFilteredRows({ useFilteredRows });

    const { initialState: dataGrid__initialState, ..._dataGridProps } = dataGridProps;

    const initialState = React.useMemo(() => {
        return {
            ...getMuiDataGridInitialState(),
            columns: { columnVisibilityModel },
            ...dataGrid__initialState,
        };
    }, [dataGrid__initialState, columnVisibilityModel]);

    const handleColumnVisibilityModelChange = React.useCallback(
        (model: GridColumnVisibilityModel, details: GridCallbackDetails) => {
            setMuiDataGridColumnVisibilityModel(model, muiDataGridTableInstanceId);
            handleUpdateFilterButtonStateOnModelChange({
                model,
                details,
                muiDataGridTableInstanceId,
            });
        },
        [handleUpdateFilterButtonStateOnModelChange, muiDataGridTableInstanceId]
    );

    const handleRowDoubleClick = React.useCallback(
        async (
            _params: GridRowParams,
            _event: MuiEvent<React.MouseEvent<HTMLElement, MouseEvent>>,
            _details: GridCallbackDetails
        ) => {
            // Set both the id and the row synchronously so dialogs opened in the
            // same tick read a fresh selected row (the row object is otherwise
            // synced one render later via useSyncMuiDataGridSelectedRowsEffect).
            setMuiDataGridSelectedRowId(`${_params.id}`, muiDataGridTableInstanceId);
            setMuiDataGridSelectedRow(_params.row, muiDataGridTableInstanceId);
            await props__handleRowDoubleClick({
                p: _params,
                e: _event,
                d: _details,
                muiDataGridTableInstanceId,
            });
        },
        [muiDataGridTableInstanceId, props__handleRowDoubleClick]
    );

    const handleRowSelectionModelChange = React.useCallback(
        (model: GridRowSelectionModel) => {
            setMuiDataGridRowSelectionModel(model, muiDataGridTableInstanceId);
        },
        [muiDataGridTableInstanceId]
    );

    const SlotToolbarDefaultComponents = React.useMemo(() => {
        if (!renderToolbarComponents) return undefined;
        return () =>
            renderToolbarComponents({
                muiDataGridTableInstanceId,
            });
    }, [muiDataGridTableInstanceId, renderToolbarComponents]);

    const SlotToolbarSelectedComponents = React.useMemo(() => {
        if (!renderSelectedToolbarComponents) return undefined;
        return (_props: { rowSelectionModel: GridRowSelectionModel }) =>
            renderSelectedToolbarComponents({
                muiDataGridTableInstanceId,
            });
    }, [muiDataGridTableInstanceId, renderSelectedToolbarComponents]);

    const SlotToolbarAdvancedComponents = React.useMemo(() => {
        if (!renderAdvancedToolbarComponents) return undefined;
        return () =>
            renderAdvancedToolbarComponents({
                muiDataGridTableInstanceId,
            });
    }, [muiDataGridTableInstanceId, renderAdvancedToolbarComponents]);

    if (!filteredRows?.length && !!noRowAlertMessage) {
        return (
            <Alert
                severity="info"
                className="px-2"
            >
                {noRowAlertMessage}
            </Alert>
        );
    }

    return (
        <MuiDataGrid
            loading={loading ?? false}
            apiRef={apiRef}
            columns={columns}
            rows={filteredRows}
            handleRowDoubleClick={handleRowDoubleClick}
            handleColumnVisibilityModelChange={handleColumnVisibilityModelChange}
            handleRowSelectionModelChange={handleRowSelectionModelChange}
            SlotToolbarDefaultComponents={SlotToolbarDefaultComponents}
            SlotToolbarSelectedComponents={SlotToolbarSelectedComponents}
            SlotToolbarAdvancedComponents={SlotToolbarAdvancedComponents}
            dataGridProps={{
                getRowId: (row) => getRowIdFromRow({ row, muiDataGridTableInstanceId }),
                columnVisibilityModel,
                initialState,
                ..._dataGridProps,
            }}
        />
    );
};

export default MuiDataGridTableMainBody;
