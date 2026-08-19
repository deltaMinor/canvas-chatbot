import React from "react";

import {
    DataGridProps,
    GridColDef,
    GridRowModel,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";

import { GetDialogProps } from "#root/interfaces/dataGrid";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import {
    DialogCustomProps,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableInstanceProps,
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import FilesTableBody from "./FilesTableBody";
import { FilesTableRefObject } from "./interface";

interface FilesTableProps<ROWREF, TABLEREF> {
    tableRef: React.RefObject<TABLEREF>;
    instanceId: string;
    refRows: ROWREF[];
    defaultVisibleFields: string[];
    dataGridProps: Partial<DataGridProps>;
    //
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    getInitRows: (props: { refRows: ROWREF[] }) => GridValidRowModel[];
    useTableColumns: (props: MuiDataGridTableInstanceProps) => GridColDef[];
    //
    useCustomDialogProps: (
        p: GetDialogProps //
    ) => DialogCustomProps[];
    useConfirmDialogProps: (
        p: GetDialogProps //
    ) => ConfirmDialogProps[];
    //
    useToolbarComponents: (
        rows: GridValidRowModel[], //
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps
    ) => React.ReactElement;
    useSelectedToolbarComponents: (
        rows: GridValidRowModel[], //
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps,
        rowSelectionModel: GridRowSelectionModel
    ) => React.ReactElement;
}

const FilesTableComponent = <
    ROWREF extends GridRowModel, //
    TABLEREF extends FilesTableRefObject,
>({
    tableRef,
    instanceId,
    ...props //
}: FilesTableProps<ROWREF, TABLEREF>) => {
    return (
        <>
            <FilesTableBody<ROWREF, TABLEREF> //
                apiRef={tableRef}
                instanceId={instanceId}
                {...props}
            />
        </>
    );
};

export default FilesTableComponent;
