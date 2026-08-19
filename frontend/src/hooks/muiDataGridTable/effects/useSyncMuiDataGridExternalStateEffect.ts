import React from "react";

import { DataGridProps } from "@mui/x-data-grid";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import {
    setMuiDataGridDataGridProps,
    updateMuiDataGridExternalState,
} from "#root/stores/muiDataGridStore";
import { updateExternalStateIfChanged } from "#root/utils/externalStateSyncUtil";

import { useMuiDataGridInstanceState } from "../muiDataGridTableFeatureHooks";

export const useSyncMuiDataGridExternalStateEffect = ({
    dataGridProps = {},
    defaultVisibleFields,
    refRows,
}: {
    dataGridProps?: Partial<DataGridProps> | undefined;
    defaultVisibleFields: string[];
    refRows: unknown[];
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const muiDataGridInstanceState = useMuiDataGridInstanceState();

    React.useEffect(() => {
        setMuiDataGridDataGridProps(dataGridProps, muiDataGridTableInstanceId);
    }, [dataGridProps, muiDataGridTableInstanceId]);

    React.useEffect(() => {
        updateExternalStateIfChanged(
            muiDataGridInstanceState.refRows,
            refRows,
            muiDataGridTableInstanceId,
            "refRows",
            updateMuiDataGridExternalState
        );
    }, [refRows, muiDataGridTableInstanceId, muiDataGridInstanceState.refRows]);

    React.useEffect(() => {
        updateExternalStateIfChanged(
            muiDataGridInstanceState.defaultVisibleFields,
            defaultVisibleFields,
            muiDataGridTableInstanceId,
            "defaultVisibleFields",
            updateMuiDataGridExternalState
        );
    }, [
        defaultVisibleFields,
        muiDataGridTableInstanceId,
        muiDataGridInstanceState.defaultVisibleFields,
    ]);
};
