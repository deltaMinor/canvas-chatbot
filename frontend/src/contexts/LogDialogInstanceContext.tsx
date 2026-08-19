import React from "react";

import { LogDialogInstanceState } from "#root/redux/logDialogFeatureSlice";
import {
    initializeLogDialogInstance,
    removeLogDialogInstance,
} from "#root/stores/logDialogFeatureStore";

export const LogDialogInstanceContext = React.createContext<string>("default");

export const useLogDialogInstanceId = () => React.useContext(LogDialogInstanceContext);

interface LogDialogInstanceContextProviderProps {
    children?: React.ReactNode;
    initialState?: Partial<LogDialogInstanceState>;
}

export const LogDialogInstanceContextProvider = ({
    children,
    initialState,
}: LogDialogInstanceContextProviderProps) => {
    const reactId = React.useId();
    const instanceId = React.useMemo(() => {
        return `dialog-log-${reactId.replace(/:/g, "_")}`;
    }, [reactId]);

    React.useEffect(() => {
        initializeLogDialogInstance(instanceId, initialState);

        return () => {
            removeLogDialogInstance(instanceId);
        };
    }, [initialState, instanceId]);

    return (
        <LogDialogInstanceContext.Provider value={instanceId}>
            {children}
        </LogDialogInstanceContext.Provider>
    );
};
