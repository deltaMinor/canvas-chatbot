import React from "react";

import { Box } from "@mui/material";
import { GridColDef, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";
import { DataGridProps } from "@mui/x-data-grid/internals";

import { GetDialogProps } from "#root/interfaces/dataGrid";
import { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import {
    DialogCustomProps,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableInstanceProps,
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import FilesTableBodyContentComponent from "./FilesTableBodyContentComponent";
import { FilesTableRefObject } from "./interface";

interface FilesTableBodyProps<ROWREF, TABLEREF> {
    apiRef: React.RefObject<TABLEREF>;
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

const FilesTableBodyComponent = <
    ROWREF extends GridValidRowModel, //
    TABLEREF extends FilesTableRefObject,
>({
    apiRef,
    instanceId,
    refRows,
    defaultVisibleFields,
    //
    dataGridProps,
    //
    getRowIdFromRow,
    getInitRows,
    useTableColumns,
    //
    useConfirmDialogProps,
    useCustomDialogProps,
    //
    useToolbarComponents,
    useSelectedToolbarComponents,
}: FilesTableBodyProps<ROWREF, TABLEREF>) => {
    return (
        <>
            <Box
                className="w-full"
                style={{
                    display: "flex",
                    textAlign: "center",
                }}
            >
                <FilesTableBodyContentComponent<ROWREF, TABLEREF>
                    apiRef={apiRef}
                    instanceId={instanceId}
                    refRows={refRows}
                    getInitRows={getInitRows}
                    defaultVisibleFields={defaultVisibleFields}
                    dataGridProps={dataGridProps}
                    getRowIdFromRow={getRowIdFromRow}
                    useTableColumns={useTableColumns}
                    useConfirmDialogProps={useConfirmDialogProps}
                    useCustomDialogProps={useCustomDialogProps}
                    useToolbarComponents={useToolbarComponents}
                    useSelectedToolbarComponents={useSelectedToolbarComponents}
                />
            </Box>
        </>
    );
};

export default FilesTableBodyComponent;
