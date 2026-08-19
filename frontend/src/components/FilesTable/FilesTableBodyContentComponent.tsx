import React from "react";

import { GridColDef, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";
import { DataGridProps } from "@mui/x-data-grid/internals";

import MuiDataGridTable from "#root/components/MuiDataGridTable";
import {
    useMuiDataGridFilterButtonState,
    useMuiDataGridFilterButtonValues,
    useMuiDataGridRowSelectionModel,
    useMuiDataGridRowsState,
} from "#root/hooks/muiDataGridTable";
import { GetDialogProps } from "#root/interfaces/dataGrid";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import {
    DialogCustomProps,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableInstanceProps,
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import { FilesTableRefObject } from "./interface";

interface FilesTableBodyContentComponentProps<ROWREF, TABLEREF> {
    apiRef: React.RefObject<TABLEREF>;
    instanceId: string;
    dataGridProps: Partial<DataGridProps>;
    defaultVisibleFields: string[];
    useCustomDialogProps: (
        p: GetDialogProps //
    ) => DialogCustomProps[];
    useConfirmDialogProps: (
        p: GetDialogProps //
    ) => ConfirmDialogProps[];
    getInitRows: (props: { refRows: ROWREF[] }) => GridValidRowModel[];
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useSelectedToolbarComponents: (
        rows: GridValidRowModel[], //
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps,
        rowSelectionModel: GridRowSelectionModel
    ) => React.ReactElement;
    useTableColumns: (props: MuiDataGridTableInstanceProps) => GridColDef[];
    useToolbarComponents: (
        rows: GridValidRowModel[], //
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps
    ) => React.ReactElement;
    refRows: ROWREF[];
}

const FilesTableBodyContentComponent = <
    ROWREF extends GridValidRowModel, //
    TABLEREF extends FilesTableRefObject,
>({
    dataGridProps,
    defaultVisibleFields,
    useConfirmDialogProps,
    useCustomDialogProps,
    getInitRows,
    getRowIdFromRow,
    useSelectedToolbarComponents,
    useTableColumns,
    useToolbarComponents,
    refRows,
    apiRef,
    instanceId,
}: FilesTableBodyContentComponentProps<ROWREF, TABLEREF>) => {
    const getTableColumns = useTableColumns;
    const getToolbarComponents = useToolbarComponents;
    const selectedToolbarComponents = useSelectedToolbarComponents;

    const useTableColumnsWithTableProps = (props: MuiDataGridTableInstanceProps) =>
        getTableColumns(props);

    const useToolbarComponentsWithTableProps = () => {
        const rows = useMuiDataGridRowsState();
        const filterButtonState = useMuiDataGridFilterButtonState();
        const filterButtonValues = useMuiDataGridFilterButtonValues();

        return getToolbarComponents(rows, filterButtonState, filterButtonValues);
    };

    const useSelectedToolbarComponentsWithTableProps = () => {
        const rows = useMuiDataGridRowsState();
        const rowSelectionModel = useMuiDataGridRowSelectionModel() as GridRowSelectionModel;
        const filterButtonState = useMuiDataGridFilterButtonState();
        const filterButtonValues = useMuiDataGridFilterButtonValues();

        return selectedToolbarComponents(
            rows,
            filterButtonState,
            filterButtonValues,
            rowSelectionModel
        );
    };

    return (
        <MuiDataGridTable.Root
            apiRef={apiRef}
            instanceId={instanceId}
        >
            <MuiDataGridTable.Content<ROWREF> //
                refRows={refRows}
                defaultVisibleFields={defaultVisibleFields}
                //
                dataGridProps={dataGridProps}
                //
                getInitRows={getInitRows}
                getRowIdFromRow={getRowIdFromRow}
                //
                useTableColumns={useTableColumnsWithTableProps}
            >
                <MuiDataGridTable.CustomDialog //
                    useCustomDialogProps={useCustomDialogProps}
                />
                <MuiDataGridTable.ConfirmDialog //
                    useConfirmDialogProps={useConfirmDialogProps}
                />
                <MuiDataGridTable.Main
                    useToolbarComponents={useToolbarComponentsWithTableProps}
                    useSelectedToolbarComponents={useSelectedToolbarComponentsWithTableProps}
                />
            </MuiDataGridTable.Content>
        </MuiDataGridTable.Root>
    );
};

export default FilesTableBodyContentComponent;
