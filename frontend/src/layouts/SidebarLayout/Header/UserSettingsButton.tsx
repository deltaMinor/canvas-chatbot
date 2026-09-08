import React from "react";

import BuildIcon from "@mui/icons-material/Build";

import { DiagramToolbarButton } from "#root/components/DiagramToolbarPrimitives";
import { DialogStateEnum } from "#root/interfaces/dialog";
import { handleOpenDialog } from "#root/stores/dialogStore";

const UserSettingsButtonComponent = () => {
    const handleClickUserSettings = React.useCallback(() => {
        handleOpenDialog(DialogStateEnum.userSettings);
    }, []);

    return (
        <>
            <DiagramToolbarButton
                className=""
                onClick={handleClickUserSettings} //
                size="small"
                startIcon={<BuildIcon />}
            >
                User Settings
            </DiagramToolbarButton>
        </>
    );
};

export default React.memo(UserSettingsButtonComponent);
