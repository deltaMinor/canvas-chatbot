import React from "react";
import { useSelector } from "react-redux";

import { GridValidRowModel } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { initRowSelectionModel } from "#root/constants/dataGrid";
import {
    MuiDataGridTableCallbackHook,
    MuiDataGridTableGetFilteredRowsProps,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableUseFilteredRows,
} from "#root/interfaces/muiDataGridTable";
import { RootState } from "#root/redux/store";
import {
    selectMuiDataGridColumnVisibilityModel,
    selectMuiDataGridColumns,
    selectMuiDataGridDataGridProps,
    selectMuiDataGridDefaultVisibleFields,
    selectMuiDataGridFilterButtonState,
    selectMuiDataGridFilterButtonValues,
    selectMuiDataGridInstanceState,
    selectMuiDataGridOpenAdvancedToolbar,
    selectMuiDataGridRefRows,
    selectMuiDataGridRowSelectionModel,
    selectMuiDataGridRows,
    selectMuiDataGridRowsInitialized,
    selectMuiDataGridSelectedRow,
    selectMuiDataGridSelectedRowId,
    selectMuiDataGridSelectedRows,
} from "#root/selectors/muiDataGridSelectors";
import {
    setMuiDataGridRowSelectionModel,
    setMuiDataGridSelectedRowId,
} from "#root/stores/muiDataGridStore";

type MuiDataGridRowIdCallback = (props: MuiDataGridTableGetRowIdFromRowProps) => string;

// Normalizes table extension callbacks to a single callable shape. Newer table
// props are hooks that return callbacks, while some existing callers still pass
// direct callbacks or no-arg hooks that return data.
export const useMuiDataGridResolvedCallback = <Props, Return>(
    callbackHook: MuiDataGridTableCallbackHook<Props, Return> | undefined
) => {
    const result = !callbackHook
        ? undefined
        : //
          callbackHook.length > 0
          ? callbackHook
          : (callbackHook as () => ((props: Props) => Return) | Return)();

    return React.useMemo(() => {
        if (result === undefined) return undefined;
        if (typeof result === "function") {
            return result as (props: Props) => Return;
        }

        return () => result as Return;
    }, [result]);
};

const getMuiDataGridRowId = ({
    getRowIdFromRow,
    muiDataGridTableInstanceId,
    row,
}: {
    getRowIdFromRow: MuiDataGridRowIdCallback;
    muiDataGridTableInstanceId: string;
    row: GridValidRowModel;
}) => {
    return getRowIdFromRow({
        row,
        muiDataGridTableInstanceId,
    });
};

export const useMuiDataGridInstanceState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridInstanceState(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridRowSelectionModel = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridRowSelectionModel(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridColumnVisibilityModel = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridColumnVisibilityModel(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridColumnsState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridColumns(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridDataGridPropsState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridDataGridProps(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridSelectedRowId = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridSelectedRowId(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridSelectedRowState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridSelectedRow(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridSelectedRowsState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridSelectedRows(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridSelectedRow = ({
    getRowIdFromRow,
}: {
    getRowIdFromRow: MuiDataGridRowIdCallback;
}) => {
    const rows = useMuiDataGridRowsState();
    const selectedRowId = useMuiDataGridSelectedRowId();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return React.useMemo(() => {
        return rows?.find(
            (row) =>
                getMuiDataGridRowId({
                    getRowIdFromRow,
                    muiDataGridTableInstanceId,
                    row,
                }) === selectedRowId
        );
    }, [getRowIdFromRow, muiDataGridTableInstanceId, rows, selectedRowId]);
};

export const useMuiDataGridSelectedRows = ({
    getRowIdFromRow,
}: {
    getRowIdFromRow: MuiDataGridRowIdCallback;
}) => {
    const rows = useMuiDataGridRowsState();
    const rowSelectionModel = useMuiDataGridRowSelectionModel();
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return React.useMemo(() => {
        return rows?.filter((row) => {
            return !!rowSelectionModel?.ids?.has(
                row["id"] ||
                    getMuiDataGridRowId({
                        getRowIdFromRow,
                        muiDataGridTableInstanceId,
                        row,
                    })
            );
        });
    }, [getRowIdFromRow, muiDataGridTableInstanceId, rowSelectionModel?.ids, rows]);
};

export const useMuiDataGridDefaultVisibleFields = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridDefaultVisibleFields(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridFilterButtonState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridFilterButtonState(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridFilterButtonValues = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridFilterButtonValues(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridFilteredRows = ({
    useFilteredRows,
}: {
    useFilteredRows: MuiDataGridTableUseFilteredRows;
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const getFilteredRows = useMuiDataGridResolvedCallback<
        MuiDataGridTableGetFilteredRowsProps,
        GridValidRowModel[]
    >(useFilteredRows);

    return React.useMemo(() => {
        return getFilteredRows?.({ muiDataGridTableInstanceId }) ?? [];
    }, [getFilteredRows, muiDataGridTableInstanceId]);
};

export const useMuiDataGridRefRows = <T = unknown>(): T[] => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridRefRows(state, muiDataGridTableInstanceId)
    ) as T[];
};

export const useMuiDataGridRowsState = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridRows(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridRowsInitialized = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridRowsInitialized(state, muiDataGridTableInstanceId)
    );
};

export const useMuiDataGridOpenAdvancedToolbar = () => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return useSelector((state: RootState) =>
        selectMuiDataGridOpenAdvancedToolbar(state, muiDataGridTableInstanceId)
    );
};

export const useResetMuiDataGridSelection = ({
    apiRef,
}: {
    apiRef: React.RefObject<GridApiCommunity>;
}) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    return React.useCallback(() => {
        if (!apiRef.current) return;

        apiRef.current.setRowSelectionModel(initRowSelectionModel);
        setMuiDataGridRowSelectionModel(initRowSelectionModel, muiDataGridTableInstanceId);
        setMuiDataGridSelectedRowId("", muiDataGridTableInstanceId);
    }, [apiRef, muiDataGridTableInstanceId]);
};
