import { GridValidRowModel } from "@mui/x-data-grid";

import {
    useInitMuiDataGridRowsEffect,
    useSyncMuiDataGridColumnVisibilityModelEffect,
    useSyncMuiDataGridColumnsEffect,
    useSyncMuiDataGridFilterButtonStateEffect,
    useSyncMuiDataGridFilterButtonValuesEffect,
    useSyncMuiDataGridSelectedRowsEffect,
} from "#root/hooks/muiDataGridTable";
import {
    MuiDataGridTableGetInitRows,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableUseTableColumns,
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

interface MuiDataGridTableEffectsProps {
    initFilterButtonState?: MuiFilterButtonStateProps;
    initFilterButtonValues?: MuiFilterButtonValueProps;
    getInitRows: MuiDataGridTableGetInitRows<GridValidRowModel>;
    refRows: GridValidRowModel[];
    useTableColumns: MuiDataGridTableUseTableColumns;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
}

const MuiDataGridTableEffects = ({
    initFilterButtonState,
    initFilterButtonValues,
    getInitRows,
    refRows,
    useTableColumns,
    getRowIdFromRow,
}: MuiDataGridTableEffectsProps) => {
    useInitMuiDataGridRowsEffect({
        getInitRows,
        refRows,
    });
    useSyncMuiDataGridColumnsEffect({ useTableColumns });
    useSyncMuiDataGridColumnVisibilityModelEffect();
    useSyncMuiDataGridFilterButtonStateEffect(initFilterButtonState);
    useSyncMuiDataGridFilterButtonValuesEffect(initFilterButtonValues);
    useSyncMuiDataGridSelectedRowsEffect({ getRowIdFromRow });

    return null;
};

export default MuiDataGridTableEffects;
