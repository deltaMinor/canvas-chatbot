import React from "react";

import { GRID_CHECKBOX_SELECTION_COL_DEF, GridColDef } from "@mui/x-data-grid";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import {
    MuiDataGridTableInstanceProps,
    MuiDataGridTableUseTableColumns,
} from "#root/interfaces/muiDataGridTable";

import {
    useMuiDataGridDataGridPropsState,
    useMuiDataGridResolvedCallback,
} from "./muiDataGridTableFeatureHooks";

export const useResolvedTableColumns = ({
    useTableColumns,
}: {
    useTableColumns: MuiDataGridTableUseTableColumns;
}): GridColDef[] => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const dataGridProps = useMuiDataGridDataGridPropsState();
    const checkboxSelection = !!dataGridProps?.checkboxSelection;
    const getTableColumns = useMuiDataGridResolvedCallback<
        MuiDataGridTableInstanceProps,
        GridColDef[]
    >(useTableColumns);

    return React.useMemo(() => {
        const tableColumns = getTableColumns?.({ muiDataGridTableInstanceId }) ?? [];
        if (!checkboxSelection) return tableColumns;

        return [
            {
                ...GRID_CHECKBOX_SELECTION_COL_DEF,
                width: 50,
            },
            ...tableColumns,
        ];
    }, [checkboxSelection, getTableColumns, muiDataGridTableInstanceId]);
};
