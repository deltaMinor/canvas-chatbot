import React from "react";

import MuiDialogTitle from "#root/components/MuiDialogTitle";

import DiagramSetupDialogActions from "./DiagramSetupDialogActions";
import DiagramSetupDialogContent from "./DiagramSetupDialogContent";

interface DiagramSetupDialogBodyProps {
    dialogTitle: string;
    noButtonText: string;
    handleCloseDialog: () => Promise<void>;
}

const DiagramSetupDialogBodyComponent = ({
    dialogTitle,
    noButtonText,
    handleCloseDialog,
}: DiagramSetupDialogBodyProps) => {
    return (
        <>
            <MuiDialogTitle title={dialogTitle} />
            <DiagramSetupDialogContent handleCloseDialog={handleCloseDialog} />
            <DiagramSetupDialogActions
                noButtonText={noButtonText}
                handleCloseDialog={handleCloseDialog}
            />
        </>
    );
};

export default React.memo(
    DiagramSetupDialogBodyComponent
) as typeof DiagramSetupDialogBodyComponent;
