import React from "react";

import { useMuiDataGridRowsState } from "#root/hooks/muiDataGridTable";
import {
    MuiDataGridTableContentContextProps,
    MuiDataGridTableGetInitRows,
    MuiDataGridTableGetRowIdFromRowProps,
    MuiDataGridTableProps,
    MuiDataGridTableUseFilteredRows,
    MuiDataGridTableUseTableColumns,
} from "#root/interfaces/muiDataGridTable";

import MuiDataGridTableContextBundle from "./MuiDataGridTableContextBundle";

const MuiDataGridTableContentPropsContext = React.createContext<
    MuiDataGridTableContentContextProps | undefined
>(undefined);

export const useMuiDataGridTableContentProps = () => {
    return React.useContext(MuiDataGridTableContentPropsContext) as
        | MuiDataGridTableContentContextProps
        | undefined;
};

export interface MuiDataGridTableContentProps<T> {
    children?: React.ReactNode;
    dataGridProps?: MuiDataGridTableProps<T>["dataGridProps"];
    defaultVisibleFields: string[];
    useFilteredRows?: MuiDataGridTableUseFilteredRows;
    getInitRows: MuiDataGridTableGetInitRows<T>;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useTableColumns: MuiDataGridTableUseTableColumns;
    initFilterButtonState?: MuiDataGridTableProps<T>["initFilterButtonState"];
    initFilterButtonValues?: MuiDataGridTableProps<T>["initFilterButtonValues"];
    refRows: T[];
}

const useDefaultFilteredRows: MuiDataGridTableUseFilteredRows = () => useMuiDataGridRowsState();

const MuiDataGridTableContent = <T,>({
    refRows,
    children,
    //
    defaultVisibleFields,
    initFilterButtonState,
    initFilterButtonValues,
    dataGridProps,
    useFilteredRows = useDefaultFilteredRows,
    getInitRows,
    getRowIdFromRow,
    //
    useTableColumns,
}: MuiDataGridTableContentProps<T>) => {
    const contentContextValue = {
        ...(dataGridProps && { dataGridProps }),
        getRowIdFromRow,
        useFilteredRows,
    } as MuiDataGridTableContentContextProps;

    return (
        <>
            <MuiDataGridTableContextBundle<T>
                defaultVisibleFields={defaultVisibleFields}
                getRowIdFromRow={getRowIdFromRow}
                useTableColumns={useTableColumns}
                {...(dataGridProps && { dataGridProps })}
                {...(initFilterButtonState && { initFilterButtonState })}
                {...(initFilterButtonValues && { initFilterButtonValues })}
                refRows={refRows}
                getInitRows={getInitRows}
            >
                <MuiDataGridTableContentPropsContext.Provider value={contentContextValue}>
                    {children}
                </MuiDataGridTableContentPropsContext.Provider>
            </MuiDataGridTableContextBundle>
        </>
    );
};

export default MuiDataGridTableContent;
