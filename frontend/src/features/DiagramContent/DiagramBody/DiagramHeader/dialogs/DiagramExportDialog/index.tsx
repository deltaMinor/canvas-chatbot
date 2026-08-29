import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import DiagramExportDialogBody from "./DiagramExportDialogBody";

const DiagramExportDialogComponent = () => {
    const dialogState = useDialogState();

    return (
        <MuiDialog
            open={!!dialogState["diagramExport"]} //
            onClose={async () => await handleCloseDialogAsync("diagramExport")}
            className="dialog"
            fullWidth
            maxWidth="xs"
        >
            <DiagramExportDialogBody />
        </MuiDialog>
    );
};

export default React.memo(DiagramExportDialogComponent);
