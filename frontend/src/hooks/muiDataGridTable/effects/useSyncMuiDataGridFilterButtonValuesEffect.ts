import React from "react";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiFilterButtonValueProps } from "#root/interfaces/muiDataGridTable";
import { setMuiDataGridFilterButtonValues } from "#root/stores/muiDataGridStore";

const defaultFilterButtonValues = {} as MuiFilterButtonValueProps;

export const useSyncMuiDataGridFilterButtonValuesEffect = (
    initFilterButtonValues: MuiFilterButtonValueProps | undefined
) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const resolvedInitFilterButtonValues = initFilterButtonValues ?? defaultFilterButtonValues;

    React.useEffect(() => {
        setMuiDataGridFilterButtonValues(
            resolvedInitFilterButtonValues,
            muiDataGridTableInstanceId
        );
    }, [resolvedInitFilterButtonValues, muiDataGridTableInstanceId]);
};
