import React from "react";

import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { Badge, Fab } from "@mui/material";

import { DEFAULT_BADGE_ZINDEX } from "#root/constants/diagram";
import { useDiagramWarningList } from "#root/hooks/diagram";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleCloseDialogAsync, handleOpenDialog } from "#root/stores/dialogStore";

import DiagramWarningFabEffects from "./DiagramWarningFabEffects";
import WarningFabDialog from "./WarningFabDialog";
import "./style.scss";

const DiagramWarningFabComponent = () => {
    const warningList = useDiagramWarningList();
    const dialogState = useDialogState();
    const open = !!dialogState[DialogStateEnum.viewDiagramWarnings];

    const handleClick = React.useCallback(() => {
        handleOpenDialog(DialogStateEnum.viewDiagramWarnings);
    }, []);

    const handleClose = React.useCallback(async () => {
        await handleCloseDialogAsync(DialogStateEnum.viewDiagramWarnings);
    }, []);

    return (
        <>
            <DiagramWarningFabEffects />
            <WarningFabDialog //
                open={open}
                handleClose={handleClose}
                warningList={warningList}
            />
            <Badge
                color="warning" //
                badgeContent={warningList.length || 0}
                sx={{
                    "& .MuiBadge-badge": {
                        zIndex: DEFAULT_BADGE_ZINDEX,
                        fontSize: 14,
                    },
                }}
            >
                <Fab
                    id="warning-button"
                    className="warningRipple h-[36px] w-[36px] min-w-auto p-1"
                    color={warningList.length ? "error" : "secondary"}
                    hidden={!warningList.length}
                    size="small"
                    variant="extended"
                    aria-label="add"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                >
                    <WarningRoundedIcon />
                </Fab>
            </Badge>
        </>
    );
};

export default React.memo(DiagramWarningFabComponent);
