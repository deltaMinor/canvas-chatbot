import React from "react";

import { DialogContent, Stack, Typography } from "@mui/material";

import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { DEFAULT_DIAGRAM_QUOTA } from "#root/constants/diagramChatbot";
import { useProject } from "#root/hooks/backendHooks";

const UserSettingsDialogBodyComponent = () => {
    const project = useProject();

    return (
        <>
            <MuiDialogTitle //
                title="User Settings"
            />
            <DialogContent>
                <Stack spacing={1}>
                    <Typography>Diagrams Generated: {project?.diagrams_generated ?? 0}</Typography>
                    <Typography>
                        Diagram quota: {project?.diagrams_generated_today ?? 0}/
                        {project?.diagram_quota ?? DEFAULT_DIAGRAM_QUOTA}
                    </Typography>
                </Stack>
            </DialogContent>
        </>
    );
};

export default React.memo(UserSettingsDialogBodyComponent);
