import React from "react";

import { DialogStateEnum } from "#root/enums/dialog";

import DiagramImportDialog from "./DiagramImportDialog";

interface DiagramInitialiseDialogProps {}

const DiagramInitialiseDialogComponent = (_props: DiagramInitialiseDialogProps) => {
    return (
        <DiagramImportDialog //
            dialogKey={DialogStateEnum.diagramImport}
            dialogTitle="Import"
            noButtonText="Cancel"
        />
    );
};

export default React.memo(DiagramInitialiseDialogComponent);
