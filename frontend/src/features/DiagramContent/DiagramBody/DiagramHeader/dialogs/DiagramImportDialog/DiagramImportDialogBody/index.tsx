import React from "react";

import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { DiagramFileOption } from "#root/interfaces/tab";

import DiagramImportDialogActions from "./DiagramImportDialogActions";
import DiagramImportDialogContent from "./DiagramImportDialogContent";

interface DiagramImportDialogBodyProps {
    dialogTitle: string;
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
    mode: DiagramFileOption.pdf | DiagramFileOption.generatedJson;
}

const DiagramImportDialogBodyComponent = ({
    dialogTitle,
    noButtonText,
    handleCloseDialog,
    mode,
}: DiagramImportDialogBodyProps) => {
    return (
        <>
            <MuiDialogTitle title={dialogTitle} />
            <DiagramImportDialogContent
                handleCloseDialog={handleCloseDialog}
                mode={mode}
            />
            <DiagramImportDialogActions
                noButtonText={noButtonText}
                handleCloseDialog={handleCloseDialog}
            />
        </>
    );
};

export default React.memo(
    DiagramImportDialogBodyComponent
) as typeof DiagramImportDialogBodyComponent;
