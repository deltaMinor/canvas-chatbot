import React from "react";

import LogDialogTableContent from "./LogDialogTableContent";
import { initLogDialogTableRef } from "./constants";
import { LogDialogTableRefObject } from "./interface";

export interface LogDialogTableProps {}

const LogDialogTableComponent = (_props: LogDialogTableProps) => {
    // Ref
    const apiRef = React.useRef<LogDialogTableRefObject>(
        initLogDialogTableRef as LogDialogTableRefObject
    );

    return (
        <LogDialogTableContent
            apiRef={apiRef}
            instanceId="log-dialog-table"
        />
    );
};

export default React.memo(LogDialogTableComponent);
