import React from "react";

import {
    MuiDataGridTableContentContextProps,
    MuiDataGridTableHandleRowDoubleClickProps,
    MuiDataGridTableHandleUpdateFilterButtonStateProps,
    MuiDataGridTableRefObject,
    MuiDataGridTableUseSelectedToolbarComponents,
    MuiDataGridTableUseToolbarComponents,
} from "#root/interfaces/muiDataGridTable";

import { useMuiDataGridTableContentProps } from "./MuiDataGridTableContent";
import MuiDataGridTableMainBody from "./MuiDataGridTableMainBody";
import { useMuiDataGridTableApiRef } from "./contexts/MuiDataGridTableApiRefContext";

export interface MuiDataGridTableMainProps {
    useAdvancedToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    useSelectedToolbarComponents?: MuiDataGridTableUseSelectedToolbarComponents;
    useToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    handleRowDoubleClick?: (props: MuiDataGridTableHandleRowDoubleClickProps) => Promise<void>;
    handleUpdateFilterButtonStateOnModelChange?: (
        props: MuiDataGridTableHandleUpdateFilterButtonStateProps
    ) => Promise<void>;
    loading?: boolean;
    noRowAlertMessage?: string;
}

const MuiDataGridTableMainComponent = (props: MuiDataGridTableMainProps = {}) => {
    const { dataGridProps, getRowIdFromRow, useFilteredRows } =
        (useMuiDataGridTableContentProps() || {}) as MuiDataGridTableContentContextProps;
    const {
        useToolbarComponents,
        useSelectedToolbarComponents,
        useAdvancedToolbarComponents,
        handleRowDoubleClick,
        handleUpdateFilterButtonStateOnModelChange,
        ...mainProps
    } = props;
    const apiRef = useMuiDataGridTableApiRef() as React.RefObject<MuiDataGridTableRefObject>;

    if (!apiRef || !getRowIdFromRow || !useFilteredRows) return null;

    return (
        <MuiDataGridTableMainBody
            apiRef={apiRef}
            getRowIdFromRow={getRowIdFromRow}
            useFilteredRows={useFilteredRows}
            {...(useToolbarComponents && {
                useToolbarComponents,
            })}
            {...(useSelectedToolbarComponents && {
                useSelectedToolbarComponents,
            })}
            {...(useAdvancedToolbarComponents && {
                useAdvancedToolbarComponents,
            })}
            {...(handleRowDoubleClick && {
                handleRowDoubleClick,
            })}
            {...(handleUpdateFilterButtonStateOnModelChange && {
                handleUpdateFilterButtonStateOnModelChange,
            })}
            {...mainProps}
            {...(dataGridProps && { dataGridProps })}
        />
    );
};

export default MuiDataGridTableMainComponent;
