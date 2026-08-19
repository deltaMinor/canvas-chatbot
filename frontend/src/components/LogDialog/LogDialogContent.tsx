import React from "react";

import MuiSkeleton from "#root/components/MuiSkeleton";
import { useLogDialogLoaded } from "#root/hooks/logDialog";

import LogDialogBodyWrapper from "./LogDialogBodyWrapper";

// const ROW_COUNT_PER_PAGE = 10;

interface LogDialogBodyProps {
    children?: React.ReactNode;
}

const LogDialogBodyComponent = ({ children }: LogDialogBodyProps) => {
    const loaded = useLogDialogLoaded();

    if (!loaded) {
        return (
            <LogDialogBodyWrapper>
                <MuiSkeleton />
            </LogDialogBodyWrapper>
        );
    }

    return <LogDialogBodyWrapper>{children}</LogDialogBodyWrapper>;
};

export default LogDialogBodyComponent;
