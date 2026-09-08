import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import UserSettingsDialogBody from "./UserSettingsDialogBody";

const UserSettingsDialogComponent = () => {
    const dialogState = useDialogState();

    return (
        <MuiDialog
            open={!!dialogState?.[DialogStateEnum.userSettings]} //
            onClose={async () => await handleCloseDialogAsync(DialogStateEnum.userSettings)}
            className="dialog"
            fullWidth
            maxWidth="xs"
        >
            <UserSettingsDialogBody />
        </MuiDialog>
    );
};

export default React.memo(UserSettingsDialogComponent);
