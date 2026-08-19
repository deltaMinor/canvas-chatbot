import React from "react";

import { Box } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import {
    MuiDataGridTableProps,
    MuiDataGridTableRefObject,
} from "#root/interfaces/muiDataGridTable";

import MuiDataGridTableContent from "./MuiDataGridTableContent";
import MuiDataGridTableMain from "./MuiDataGridTableMain";
import { MuiDataGridTableApiRefContextProvider } from "./contexts/MuiDataGridTableApiRefContext";
import { MuiDataGridTableInstanceContextProvider } from "./contexts/MuiDataGridTableInstanceContext";
import MuiDataGridTableConfirmDialog from "./dialogs/MuiDataGridTableConfirmDialog";
import MuiDataGridTableCustomDialog from "./dialogs/MuiDataGridTableCustomDialog";
import MuiDataGridTableFieldDialog from "./dialogs/MuiDataGridTableFieldDialog";
import MuiDataGridTableLogDialog from "./dialogs/MuiDataGridTableLogDialog";

export type { MuiDataGridTableProps } from "#root/interfaces/muiDataGridTable";

export interface MuiDataGridTableRootProps {
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    children?: React.ReactNode;
    instanceId: string;
}

const getApiRefInstanceId = (apiRef: React.RefObject<MuiDataGridTableRefObject>) => {
    const tableApiRef = apiRef as React.RefObject<MuiDataGridTableRefObject> & {
        muiDataGridTableInstanceId?: string;
    };

    if (!tableApiRef.muiDataGridTableInstanceId) {
        tableApiRef.muiDataGridTableInstanceId = `muiDataGridTable__${uuidv4()}`;
    }

    return tableApiRef.muiDataGridTableInstanceId;
};

const MuiDataGridTableRoot = ({ apiRef, children, instanceId }: MuiDataGridTableRootProps) => {
    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
            <MuiDataGridTableApiRefContextProvider apiRef={apiRef}>
                <MuiDataGridTableInstanceContextProvider muiDataGridTableInstanceId={instanceId}>
                    {children}
                </MuiDataGridTableInstanceContextProvider>
            </MuiDataGridTableApiRefContextProvider>
        </Box>
    );
};

const MuiDataGridTableComponent = <T,>(props: MuiDataGridTableProps<T>) => {
    const {
        apiRef,
        useConfirmDialogProps,
        useCustomDialogProps,
        dataGridProps,
        useAdvancedToolbarComponents,
        useSelectedToolbarComponents,
        useToolbarComponents,
        handleRowDoubleClick,
        handleUpdateFilterButtonStateOnModelChange,
        loading,
        noRowAlertMessage,
        muiDataGridTableInstanceId,
        useFieldDialogProps,
        getInitRows,
        useLogDialogProps,
        refRows,
        ...contentProps
    } = props;
    const instanceId = muiDataGridTableInstanceId ?? getApiRefInstanceId(apiRef);

    return (
        <MuiDataGridTableRoot
            apiRef={apiRef as React.RefObject<MuiDataGridTableRefObject>}
            instanceId={instanceId}
        >
            <MuiDataGridTableContent<T>
                {...contentProps}
                refRows={refRows}
                getInitRows={getInitRows}
                {...(dataGridProps && { dataGridProps })}
            >
                {useCustomDialogProps && (
                    <MuiDataGridTableCustomDialog //
                        useCustomDialogProps={useCustomDialogProps}
                    />
                )}
                {useFieldDialogProps && (
                    <MuiDataGridTableFieldDialog //
                        useFieldDialogProps={useFieldDialogProps}
                    />
                )}
                {useConfirmDialogProps && (
                    <MuiDataGridTableConfirmDialog //
                        useConfirmDialogProps={useConfirmDialogProps}
                    />
                )}
                {useLogDialogProps && (
                    <MuiDataGridTableLogDialog //
                        useLogDialogProps={useLogDialogProps}
                    />
                )}
                <MuiDataGridTableMain
                    {...(useAdvancedToolbarComponents && { useAdvancedToolbarComponents })}
                    {...(useSelectedToolbarComponents && { useSelectedToolbarComponents })}
                    {...(useToolbarComponents && { useToolbarComponents })}
                    {...(handleRowDoubleClick && { handleRowDoubleClick })}
                    {...(handleUpdateFilterButtonStateOnModelChange && {
                        handleUpdateFilterButtonStateOnModelChange,
                    })}
                    {...(loading !== undefined && { loading })}
                    {...(noRowAlertMessage && { noRowAlertMessage })}
                />
            </MuiDataGridTableContent>
        </MuiDataGridTableRoot>
    );
};

const MuiDataGridTable = Object.assign(MuiDataGridTableComponent, {
    ConfirmDialog: MuiDataGridTableConfirmDialog,
    Content: MuiDataGridTableContent,
    CustomDialog: MuiDataGridTableCustomDialog,
    FieldDialog: MuiDataGridTableFieldDialog,
    LogDialog: MuiDataGridTableLogDialog,
    Main: MuiDataGridTableMain,
    Root: MuiDataGridTableRoot,
});

export default MuiDataGridTable;
