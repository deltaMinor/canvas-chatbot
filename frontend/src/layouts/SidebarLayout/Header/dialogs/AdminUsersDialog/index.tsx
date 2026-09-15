import React from "react";

import MuiDialog from "#root/components/MuiDialog";
import { useDialogState } from "#root/hooks/dialogHooks";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleCloseDialogAsync } from "#root/stores/dialogStore";

import AdminUsersDialogBody from "./AdminUsersDialogBody";

const AdminUsersDialogComponent = () => {
    const dialogState = useDialogState();

    return (
        <MuiDialog
            open={!!dialogState?.[DialogStateEnum.adminUsers]} //
            onClose={async () => await handleCloseDialogAsync(DialogStateEnum.adminUsers)}
            className="dialog"
            fullWidth
            maxWidth="md"
        >
            <AdminUsersDialogBody />
        </MuiDialog>
    );
};

export default React.memo(AdminUsersDialogComponent);
