import React from "react";

import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";

const MuiDataGridTableApiRefContext = React.createContext<
    React.RefObject<MuiDataGridTableRefObject> | undefined
>(undefined);

export const MuiDataGridTableApiRefContextProvider = ({
    apiRef,
    children,
}: {
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    children?: React.ReactNode;
}) => {
    return (
        <MuiDataGridTableApiRefContext.Provider value={apiRef}>
            {children}
        </MuiDataGridTableApiRefContext.Provider>
    );
};

export const useMuiDataGridTableApiRef = () => {
    const apiRef = React.useContext(MuiDataGridTableApiRefContext);
    if (!apiRef) {
        throw new Error(
            "MuiDataGridTable apiRef is missing. Wrap the table in MuiDataGridTable.Root."
        );
    }
    return apiRef;
};
