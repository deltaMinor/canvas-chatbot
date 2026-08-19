import React from "react";

import { GridValidRowModel } from "@mui/x-data-grid";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiDataGridTableGetInitRows } from "#root/interfaces/muiDataGridTable";
import { setMuiDataGridRows } from "#root/stores/muiDataGridStore";

export const useInitMuiDataGridRowsEffect = ({
    getInitRows,
    refRows,
}: {
    getInitRows: MuiDataGridTableGetInitRows<GridValidRowModel>;
    refRows: GridValidRowModel[];
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    React.useEffect(() => {
        const initialRows = getInitRows({ refRows });
        setMuiDataGridRows(initialRows, muiDataGridTableInstanceId);
    }, [getInitRows, muiDataGridTableInstanceId, refRows]);
};
