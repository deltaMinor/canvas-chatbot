import React from "react";

import DiagramHeaderBody from "./DiagramHeaderBody";
import DiagramExportDialog from "./dialogs/DiagramExportDialog";
import DiagramHeaderDialogConfirm from "./dialogs/DiagramHeaderDialogConfirm";
import DiagramInitialiseDialog from "./dialogs/DiagramInitialiseDialog";

const DiagramHeaderComponent = () => {
    return (
        <>
            <DiagramHeaderDialogConfirm />
            <DiagramInitialiseDialog />
            <DiagramExportDialog />
            <DiagramHeaderBody />
        </>
    );
};

export default React.memo(DiagramHeaderComponent);
