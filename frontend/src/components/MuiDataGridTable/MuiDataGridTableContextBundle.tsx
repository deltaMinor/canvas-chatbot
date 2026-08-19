import React from "react";

import { DataGridProps, GridValidRowModel } from "@mui/x-data-grid";

import {
    MuiDataGridTableGetInitRows,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableUseTableColumns,
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import MuiDataGridTableEffects from "./MuiDataGridTableEffects";
import MuiDataGridTableInstanceStateEffects from "./MuiDataGridTableInstanceStateEffects";

interface MuiDataGridTableContextBundleProps<T> {
    children?: React.ReactNode;
    dataGridProps?: Partial<DataGridProps>;
    defaultVisibleFields: string[];
    getInitRows: MuiDataGridTableGetInitRows<T>;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useTableColumns: MuiDataGridTableUseTableColumns;
    initFilterButtonState?: MuiFilterButtonStateProps;
    initFilterButtonValues?: MuiFilterButtonValueProps;
    refRows: T[];
}

const MuiDataGridTableContextBundle = <T,>({
    children,
    dataGridProps,
    defaultVisibleFields,
    getInitRows,
    getRowIdFromRow,
    useTableColumns,
    initFilterButtonState,
    initFilterButtonValues,
    refRows,
}: MuiDataGridTableContextBundleProps<T>) => {
    return (
        <>
            <MuiDataGridTableInstanceStateEffects<T>
                {...(dataGridProps && { dataGridProps })}
                defaultVisibleFields={defaultVisibleFields}
                refRows={refRows}
            />
            <MuiDataGridTableEffects
                {...(initFilterButtonState && { initFilterButtonState })}
                {...(initFilterButtonValues && { initFilterButtonValues })}
                getInitRows={getInitRows as MuiDataGridTableGetInitRows<GridValidRowModel>}
                refRows={refRows as GridValidRowModel[]}
                useTableColumns={useTableColumns}
                getRowIdFromRow={getRowIdFromRow}
            />
            {children}
        </>
    );
};

export default MuiDataGridTableContextBundle;
