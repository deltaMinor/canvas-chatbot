import React from "react";

import { DialogStateEnum } from "#root/enums/dialog";
import { DiagramFileOption } from "#root/interfaces/tab";

import DiagramImportDialog from "./DiagramImportDialog";

interface DiagramInitialiseDialogProps {}

const DiagramInitialiseDialogComponent = (_props: DiagramInitialiseDialogProps) => {
    return (
        <>
            <DiagramImportDialog //
                dialogKey={DialogStateEnum.diagramImport}
                dialogTitle="Import PDF"
                noButtonText="Cancel"
                mode={DiagramFileOption.pdf}
            />
            <DiagramImportDialog //
                dialogKey={DialogStateEnum.diagramGeneratedJsonImport}
                dialogTitle="Generated Diagrams"
                noButtonText="Cancel"
                mode={DiagramFileOption.generatedJson}
            />
        </>
    );
};

export default React.memo(DiagramInitialiseDialogComponent);
