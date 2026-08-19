import React from "react";

import { DialogStateEnum } from "#root/enums/dialog";

import DiagramSetupDialog from "./DiagramSetupDialog";

interface DiagramInitialiseDialogProps {}

const DiagramInitialiseDialogComponent = (_props: DiagramInitialiseDialogProps) => {
    return (
        <DiagramSetupDialog //
            dialogKey={DialogStateEnum.diagramSetup}
            dialogTitle="Import"
            noButtonText="Cancel"
        />
    );
};

export default React.memo(DiagramInitialiseDialogComponent);
