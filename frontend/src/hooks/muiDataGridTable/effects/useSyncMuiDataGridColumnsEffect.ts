import React from "react";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiDataGridTableUseTableColumns } from "#root/interfaces/muiDataGridTable";
import { setMuiDataGridColumns } from "#root/stores/muiDataGridStore";

import { useResolvedTableColumns } from "../useResolvedTableColumns";

export const useSyncMuiDataGridColumnsEffect = ({
    useTableColumns,
}: {
    useTableColumns: MuiDataGridTableUseTableColumns;
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const resolvedColumns = useResolvedTableColumns({ useTableColumns });

    React.useEffect(() => {
        setMuiDataGridColumns(resolvedColumns, muiDataGridTableInstanceId);
    }, [muiDataGridTableInstanceId, resolvedColumns]);
};
