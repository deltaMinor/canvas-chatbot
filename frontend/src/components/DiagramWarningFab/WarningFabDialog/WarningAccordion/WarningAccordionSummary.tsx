import React from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DangerousIcon from "@mui/icons-material/Dangerous";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { AccordionSummary, Box, Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import { WarningType } from "#root/enums/diagram";
import {
    useDiagramDraftCanvasId,
    useFocusDiagramEdge,
    useFocusDiagramNode,
    useSetDiagramWarningListMapping,
} from "#root/hooks/diagram";
import { WarningMessage } from "#root/interfaces/diagram";

interface WarningAccordionSummaryProps {
    warningMessage: WarningMessage;
    warningList: WarningMessage[];
}

const WarningAccordionSummaryComponent = ({
    warningMessage,
    warningList,
}: WarningAccordionSummaryProps) => {
    const selectedCanvasId = useDiagramDraftCanvasId();
    const setDiagramWarningListMapping = useSetDiagramWarningListMapping();
    const focusDiagramEdge = useFocusDiagramEdge();
    const focusDiagramNode = useFocusDiagramNode();

    const {
        isHidden,
        priority,
        warningId,
        warningType, //
        title,
        edgeId,
        nodeId,
    } = warningMessage;

    const handleChangeWarningVisibility = React.useCallback(
        (
            event: React.MouseEvent, //
            warningId: string
        ) => {
            event.stopPropagation();

            if (!selectedCanvasId) throw new Error("No selected canvas.");

            const nextWarningList =
                warningList?.map((a) => {
                    if (a.warningId === warningId) {
                        a.isHidden = !a.isHidden;
                    }
                    return a;
                }) || [];
            setDiagramWarningListMapping((prev) => ({
                ...prev, //
                [selectedCanvasId]: nextWarningList,
            }));
        },
        [selectedCanvasId, setDiagramWarningListMapping, warningList]
    );

    return (
        <AccordionSummary //
            expandIcon={<ArrowDropDownIcon />}
        >
            <Stack
                direction="row" //
                spacing={1}
            >
                <Box
                    sx={{
                        opacity: !!isHidden ? 0.5 : 1, //
                    }}
                >
                    {warningType === WarningType.dataFlow ? (
                        <DangerousIcon
                            color={
                                priority > 5 //
                                    ? "error"
                                    : "warning"
                            }
                        />
                    ) : (
                        <GppMaybeIcon
                            color={
                                priority > 5 //
                                    ? "error"
                                    : "warning"
                            }
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        opacity: !!isHidden ? 0.5 : 1, //
                        flexGrow: 1,
                    }}
                >
                    <Typography //
                        marginLeft={1}
                        variant="body1"
                        textAlign="left"
                    >
                        {title}
                    </Typography>
                </Box>
                <Stack direction="row">
                    <MuiButton
                        onClick={(event) => {
                            event.stopPropagation();

                            if (!!edgeId) {
                                focusDiagramEdge(edgeId);
                            } else if (!!nodeId) {
                                focusDiagramNode(nodeId);
                            }
                        }}
                        sx={{ opacity: !!isHidden ? 0.5 : 1 }}
                        startIcon={<SearchIcon />}
                        disabled={warningType === WarningType.dataFlow}
                    />
                    <MuiButton
                        onClick={(event) =>
                            handleChangeWarningVisibility(
                                event, //
                                warningId
                            )
                        }
                        startIcon={
                            !!isHidden ? ( //
                                <VisibilityIcon />
                            ) : (
                                <VisibilityOffIcon />
                            )
                        }
                    />
                </Stack>
            </Stack>
        </AccordionSummary>
    );
};

export default WarningAccordionSummaryComponent;
