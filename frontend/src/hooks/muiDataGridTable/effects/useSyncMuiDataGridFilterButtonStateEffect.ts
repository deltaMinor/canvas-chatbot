import React from "react";

import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { MuiFilterButtonStateProps } from "#root/interfaces/muiDataGridTable";
import { setMuiDataGridFilterButtonState } from "#root/stores/muiDataGridStore";

const defaultFilterButtonState = {} as MuiFilterButtonStateProps;

export const useSyncMuiDataGridFilterButtonStateEffect = (
    initFilterButtonState: MuiFilterButtonStateProps | undefined
) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();
    const resolvedInitFilterButtonState = initFilterButtonState ?? defaultFilterButtonState;

    React.useEffect(() => {
        setMuiDataGridFilterButtonState(resolvedInitFilterButtonState, muiDataGridTableInstanceId);
    }, [resolvedInitFilterButtonState, muiDataGridTableInstanceId]);
};
