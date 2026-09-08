import React from "react";

import {
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { useDownloadDiagramPng } from "#root/hooks/diagram";
import { DiagramExportFormat, DiagramExportFormatLabel } from "#root/interfaces/diagram";
import { DialogStateEnum } from "#root/interfaces/dialog";
import CallApiWithSnackbar from "#root/services/CallApiWithSnackbar";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import { getArchitectureEdges, getArchitectureNodes } from "#root/utils/diagram/backendDiagramUtil";
import { generateDrawioXml } from "#root/utils/diagram/diagramXmlExportUtil";
import { downloadDrawioXml, downloadJson } from "#root/utils/fileDownloadHelper";

const DiagramExportDialogBodyComponent = () => {
    const downloadDiagramPng = useDownloadDiagramPng();

    const exportOptions = Object.values(DiagramExportFormat).map((value) => ({
        label: DiagramExportFormatLabel[value],
        value,
    }));

    // Hooks
    const [selectedOption, setSelectedOption] = React.useState<string>("");

    const handleDownloadJson = React.useCallback(async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                const projectDiagram = getProjectDiagramFromStore();
                if (!projectDiagram) return;

                const { conversations: _conversations, ...projectDiagramWithoutConversations } =
                    projectDiagram as typeof projectDiagram & { conversations?: unknown };

                downloadJson(
                    {
                        _generated_by: "pdf-json-parser-v1",
                        ...projectDiagramWithoutConversations,
                    }, //
                    "project_diagram"
                );
            },
            message: "Downloading ...",
            messageOnError: "Failed to download json.",
        });
    }, []);

    const handleDownloadPng = React.useCallback(async () => {
        await CallApiWithSnackbar({
            async_func: async () => downloadDiagramPng(),
            message: "Downloading ...",
            messageOnError: "Failed to download PNG. Please reload the page and retry.",
        });
    }, [downloadDiagramPng]);

    const handleDownloadDrawio = React.useCallback(async () => {
        await CallApiWithSnackbar({
            async_func: async () => {
                const projectDiagram = getProjectDiagramFromStore();
                if (!projectDiagram) return;

                const nodes = getArchitectureNodes(projectDiagram);
                const edges = getArchitectureEdges(projectDiagram);
                const xmlContent = await generateDrawioXml(nodes, edges);

                downloadDrawioXml(
                    xmlContent, //
                    "project_diagram"
                );
            },
            message: "Downloading ...",
            messageOnError: "Failed to download drawio file.",
        });
    }, []);

    const handleChangeOption = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedOption(event?.target?.value);
        },
        [setSelectedOption]
    );

    const handleClickConfirm = async () => {
        await handleCloseDialogAsync(DialogStateEnum.diagramExport);
        if (selectedOption === DiagramExportFormat.json) {
            await runWithHeavyExecutionGuard(() => {
                void handleDownloadJson();
            });
        }
        if (selectedOption === DiagramExportFormat.png) {
            await runWithHeavyExecutionGuard(() => {
                void handleDownloadPng();
            });
        }
        if (selectedOption === DiagramExportFormat.drawio) {
            await runWithHeavyExecutionGuard(() => {
                void handleDownloadDrawio();
            });
        }
    };

    const handleClickCancel = async () => {
        await handleCloseDialogAsync(DialogStateEnum.diagramExport);
    };

    return (
        <>
            <MuiDialogTitle //
                title="Export Diagram"
            />
            <DialogContent>
                <FormControl fullWidth>
                    <FormLabel
                        className="pb-1" //
                    >
                        Choose format
                    </FormLabel>
                    <RadioGroup
                        value={selectedOption} //
                        onChange={handleChangeOption}
                    >
                        {exportOptions?.map((opt) => {
                            return (
                                <FormControlLabel
                                    control={<Radio />}
                                    label={opt.label}
                                    value={opt.value} //
                                    key={opt.value}
                                />
                            );
                        })}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <MuiButton //
                    onClick={handleClickCancel}
                >
                    Cancel
                </MuiButton>
                <MuiButton //
                    variant="contained"
                    onClick={handleClickConfirm}
                >
                    Confirm
                </MuiButton>
            </DialogActions>
        </>
    );
};

export default DiagramExportDialogBodyComponent;
