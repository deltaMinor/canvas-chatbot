import React from "react";

import MuiDialogTitle from "#root/components/MuiDialogTitle";

import DiagramImportDialogActions from "./DiagramImportDialogActions";
import DiagramImportDialogContent from "./DiagramImportDialogContent";

interface DiagramImportDialogBodyProps {
    dialogTitle: string;
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
}

const DiagramImportDialogBodyComponent = ({
    dialogTitle,
    noButtonText,
    handleCloseDialog,
}: DiagramImportDialogBodyProps) => {
    return (
        <>
            <MuiDialogTitle title={dialogTitle} />
            <DiagramImportDialogContent handleCloseDialog={handleCloseDialog} />
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
