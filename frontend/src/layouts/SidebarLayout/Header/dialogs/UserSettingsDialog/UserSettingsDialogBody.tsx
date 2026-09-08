import React from "react";

import { DialogContent } from "@mui/material";

import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { useProject } from "#root/hooks/backendHooks";

const UserSettingsDialogBodyComponent = () => {
    const project = useProject();

    return (
        <>
            <MuiDialogTitle //
                title="User Settings"
            />
            <DialogContent>Diagrams Generated: {project?.diagrams_generated ?? 0}</DialogContent>
        </>
    );
};

export default React.memo(UserSettingsDialogBodyComponent);
