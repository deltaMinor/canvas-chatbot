import React from "react";

import { Alert } from "@mui/material";
import { DataGridProps, GridRowParams } from "@mui/x-data-grid";

import MuiDataGridTable from "#root/components/MuiDataGridTable";
import { useLogDialogInstanceId } from "#root/contexts/LogDialogInstanceContext";
import { useLogDialogLogs } from "#root/hooks/logDialog";
import { AuditLog } from "#root/interfaces";
import {
    MuiDataGridTableHandleRowDoubleClickProps,
    MuiDataGridTableInstanceProps,
    MuiDataGridTableRefObject,
} from "#root/interfaces/muiDataGridTable";
import {
    setLogDialogDetailsDialogOpen,
    setLogDialogSelectedAuditLogId,
} from "#root/stores/logDialogFeatureStore";

import LogDialogTableDetailsDialog from "./LogDialogTableDetailsDialog";
import { getLogColumns } from "./columns";
import { defaultVisibleFields, getLogDialogTableDataGridProps } from "./constants";
import { getLogInitRows, getLogRowIdFromRow } from "./rows";

export interface LogDialogTableContentProps {
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    instanceId: string;
}

const LogDialogTableContent = ({ apiRef, instanceId }: LogDialogTableContentProps) => {
    const logs = useLogDialogLogs();
    const logDialogInstanceId = useLogDialogInstanceId();

    const refRows = React.useMemo(() => logs || [], [logs]);

    const isRowSelectable = React.useCallback<NonNullable<DataGridProps["isRowSelectable"]>>(
        (
            _params: GridRowParams //
        ) => {
            return false; // Disable row selection for logs
        },
        []
    );

    const handleRowDoubleClick = React.useCallback(
        async ({ p }: MuiDataGridTableHandleRowDoubleClickProps) => {
            if (p.id) {
                setLogDialogSelectedAuditLogId(String(p.id), logDialogInstanceId);
                setLogDialogDetailsDialogOpen(true, logDialogInstanceId);
            }
        },
        [logDialogInstanceId]
    );

    const useTableColumns = (_props: MuiDataGridTableInstanceProps) => getLogColumns();

    if (!logs?.length) {
        return (
            <Alert
                severity="info"
                className="px-2"
            >
                No logs found.
            </Alert>
        );
    }

    return (
        <>
            <MuiDataGridTable.Root
                apiRef={apiRef}
                instanceId={instanceId}
            >
                <MuiDataGridTable.Content<AuditLog> // //
                    defaultVisibleFields={defaultVisibleFields}
                    refRows={refRows}
                    //
                    dataGridProps={getLogDialogTableDataGridProps({ isRowSelectable })}
                    //
                    getInitRows={getLogInitRows}
                    getRowIdFromRow={getLogRowIdFromRow}
                    //
                    useTableColumns={useTableColumns}
                    //
                >
                    <MuiDataGridTable.Main handleRowDoubleClick={handleRowDoubleClick} />
                </MuiDataGridTable.Content>
            </MuiDataGridTable.Root>
            <LogDialogTableDetailsDialog />
        </>
    );
};

export default LogDialogTableContent;
