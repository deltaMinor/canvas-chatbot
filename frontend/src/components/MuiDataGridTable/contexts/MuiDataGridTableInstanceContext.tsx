import React from "react";

import {
    initializeMuiDataGridInstance,
    removeMuiDataGridInstance,
} from "#root/stores/muiDataGridStore";

interface MuiDataGridTableInstanceContextValue {
    muiDataGridTableInstanceId: string;
}

export const MuiDataGridTableInstanceContext =
    React.createContext<MuiDataGridTableInstanceContextValue>({
        muiDataGridTableInstanceId: "default",
    });

interface MuiDataGridTableInstanceContextProviderProps {
    children?: React.ReactNode;
    muiDataGridTableInstanceId: string;
}

export const MuiDataGridTableInstanceContextProvider = ({
    children,
    muiDataGridTableInstanceId,
}: MuiDataGridTableInstanceContextProviderProps) => {
    React.useEffect(() => {
        initializeMuiDataGridInstance(muiDataGridTableInstanceId);

        return () => {
            removeMuiDataGridInstance(muiDataGridTableInstanceId);
        };
    }, [muiDataGridTableInstanceId]);

    const value = React.useMemo(
        () => ({
            muiDataGridTableInstanceId,
        }),
        [muiDataGridTableInstanceId]
    );

    return (
        <MuiDataGridTableInstanceContext.Provider value={value}>
            {children}
        </MuiDataGridTableInstanceContext.Provider>
    );
};

export const useMuiDataGridTableInstanceId = () => {
    return React.useContext(MuiDataGridTableInstanceContext).muiDataGridTableInstanceId;
};
