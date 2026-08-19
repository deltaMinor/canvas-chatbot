import { DataGridProps } from "@mui/x-data-grid";

import { useSyncMuiDataGridExternalStateEffect } from "#root/hooks/muiDataGridTable";

interface MuiDataGridTableInstanceStateEffectsProps<T> {
    dataGridProps?: Partial<DataGridProps>;
    defaultVisibleFields: string[];
    refRows: T[];
}

const MuiDataGridTableInstanceStateEffects = <T,>({
    dataGridProps,
    defaultVisibleFields,
    refRows,
}: MuiDataGridTableInstanceStateEffectsProps<T>) => {
    useSyncMuiDataGridExternalStateEffect({
        dataGridProps,
        defaultVisibleFields,
        refRows: refRows ?? [],
    });

    return null;
};

export default MuiDataGridTableInstanceStateEffects;
