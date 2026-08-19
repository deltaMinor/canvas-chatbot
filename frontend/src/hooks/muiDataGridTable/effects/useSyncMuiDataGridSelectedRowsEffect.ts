import React from "react";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiDataGridTableGetRowIdFromRowProps } from "#root/interfaces/muiDataGridTable";
import {
    setMuiDataGridSelectedRow,
    setMuiDataGridSelectedRows,
} from "#root/stores/muiDataGridStore";

import {
    useMuiDataGridSelectedRow,
    useMuiDataGridSelectedRows,
} from "../muiDataGridTableFeatureHooks";

export const useSyncMuiDataGridSelectedRowsEffect = ({
    getRowIdFromRow,
}: {
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const selectedRow = useMuiDataGridSelectedRow({ getRowIdFromRow });
    const selectedRows = useMuiDataGridSelectedRows({ getRowIdFromRow });

    React.useEffect(() => {
        setMuiDataGridSelectedRow(selectedRow, muiDataGridTableInstanceId);
    }, [muiDataGridTableInstanceId, selectedRow]);

    React.useEffect(() => {
        setMuiDataGridSelectedRows(selectedRows ?? [], muiDataGridTableInstanceId);
    }, [muiDataGridTableInstanceId, selectedRows]);
};
