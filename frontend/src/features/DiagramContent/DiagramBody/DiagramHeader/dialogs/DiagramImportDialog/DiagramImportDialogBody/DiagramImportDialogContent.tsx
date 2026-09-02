import React from "react";

import { Alert, DialogContent } from "@mui/material";

import { options_dict } from "#root/constants/diagramImportDialog";
import {
    useDiagramCapabilitiesState,
    useSetDiagramSetupPendingSelectedOption,
    useSetDiagramSetupSelectedOption,
} from "#root/hooks/diagram";
import { DiagramFileOption } from "#root/interfaces/tab";

import ImportPdfOptionBody from "./ImportPdfOptionBody";
import ViewGeneratedJsonsOptionBody from "./ViewGeneratedJsonsOptionBody";

interface DiagramImportDialogContentProps {
    handleCloseDialog: () => Promise<void>;
    mode: DiagramFileOption.pdf | DiagramFileOption.generatedJson;
}

/**
 * Each import dialog now only ever deals with a single import option (PDF or
 * generated JSON), rather than letting the user switch between them via a
 * radio group. The underlying "setup selected option" state is kept, since
 * the option body components below still key off it, but it's now set
 * automatically for the dialog's fixed `mode` as soon as the dialog opens.
 */
const DiagramImportDialogContentComponent = ({
    handleCloseDialog,
    mode,
}: DiagramImportDialogContentProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const setPendingSelectedOption = useSetDiagramSetupPendingSelectedOption();
    const setSelectedOption = useSetDiagramSetupSelectedOption();

    const isPdfMode = mode === options_dict.pdf.key;
    const optionKey = isPdfMode ? options_dict.pdf.key : options_dict.generatedJson.key;
    const isEnabled = isPdfMode
        ? capabilities.toolbar.selectPdfOption.enabled
        : capabilities.toolbar.selectGeneratedJsonOption.enabled;

    React.useEffect(() => {
        if (!isEnabled) return;
        setPendingSelectedOption(optionKey);
        setSelectedOption(optionKey);
    }, [isEnabled, optionKey, setPendingSelectedOption, setSelectedOption]);

    return (
        <DialogContent className="pb-0">
            {!isEnabled ? (
                <Alert severity="info">
                    You do not have permission to{" "}
                    {isPdfMode ? "upload PDF files" : "view generated diagrams"}.
                </Alert>
            ) : isPdfMode ? (
                <ImportPdfOptionBody
                    handleCloseDialog={handleCloseDialog}
                    pendingSelectedOption={optionKey}
                    selectedOption={optionKey}
                />
            ) : (
                <ViewGeneratedJsonsOptionBody
                    handleCloseDialog={handleCloseDialog}
                    pendingSelectedOption={optionKey}
                    selectedOption={optionKey}
                />
            )}
        </DialogContent>
    );
};

export default DiagramImportDialogContentComponent;
