import React from "react";

import {
    DialogContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";

import { options_dict } from "#root/constants/diagramImportDialog";
import {
    useDiagramCapabilitiesState,
    useDiagramSetupPendingSelectedOption,
    useDiagramSetupSelectedOption,
    useSetDiagramSetupPendingSelectedOption,
    useSetDiagramSetupSelectedOption,
} from "#root/hooks/diagram";
import useDebouncedCallbackHook from "#root/hooks/useDebouncedCallback";

import ImportPdfOptionBody from "./ImportPdfOptionBody";

interface DiagramImportDialogContentProps {
    handleCloseDialog: () => Promise<void>;
}

const DiagramImportDialogContentComponent = ({
    handleCloseDialog,
}: DiagramImportDialogContentProps) => {
    const capabilities = useDiagramCapabilitiesState();
    const selectedOption = useDiagramSetupSelectedOption();
    const pendingSelectedOption = useDiagramSetupPendingSelectedOption();
    const setPendingSelectedOption = useSetDiagramSetupPendingSelectedOption();
    const setSelectedOption = useSetDiagramSetupSelectedOption();

    const { debouncedCallback: commitSelectedOption } = useDebouncedCallbackHook(
        (value: string) => {
            setSelectedOption(value);
        },
        150
    );

    React.useEffect(() => {
        setPendingSelectedOption(selectedOption);
    }, [selectedOption]);

    const handleChangeOption = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextOption = event.target.value;
            setPendingSelectedOption(nextOption);
            commitSelectedOption(nextOption);
        },
        [commitSelectedOption]
    );

    return (
        <DialogContent className="pb-0">
            <FormControl fullWidth>
                <FormLabel className="pb-1">Initialise Architecture Diagram Canvas By</FormLabel>
                <RadioGroup
                    value={pendingSelectedOption}
                    onChange={handleChangeOption}
                >
                    <FormControlLabel
                        control={<Radio />}
                        label={options_dict.pdf.title}
                        value={options_dict.pdf.key}
                        disabled={!capabilities.toolbar.selectPdfOption.enabled}
                    />
                    <ImportPdfOptionBody
                        handleCloseDialog={handleCloseDialog}
                        pendingSelectedOption={pendingSelectedOption}
                        selectedOption={selectedOption}
                    />
                </RadioGroup>
            </FormControl>
        </DialogContent>
    );
};

export default DiagramImportDialogContentComponent;
