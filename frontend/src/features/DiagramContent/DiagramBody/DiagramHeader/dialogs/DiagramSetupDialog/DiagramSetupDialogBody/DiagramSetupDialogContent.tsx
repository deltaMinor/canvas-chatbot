import React from "react";

import {
    DialogContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";

import { options_dict } from "#root/constants/diagramSetupDialog";
import {
    useDiagramCapabilitiesState,
    useDiagramSetupPendingSelectedOption,
    useDiagramSetupSelectedOption,
    useSetDiagramSetupPendingSelectedOption,
    useSetDiagramSetupSelectedOption,
} from "#root/hooks/diagram";
import useDebouncedCallbackHook from "#root/hooks/useDebouncedCallback";

import ImportPdfOptionBody from "./ImportPdfOptionBody";

interface DiagramSetupDialogContentProps {
    handleCloseDialog: () => Promise<void>;
}

/**
 * This demo only wires up the chatbot's PDF-driven setup flow. The full
 * application also offers XML/IaC/image/JSON/Cacti/template/natural-language
 * import options, which have been removed here as out of scope for
 * demonstrating the diagram canvas chatbot.
 */
const DiagramSetupDialogContentComponent = ({
    handleCloseDialog,
}: DiagramSetupDialogContentProps) => {
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

export default DiagramSetupDialogContentComponent;
