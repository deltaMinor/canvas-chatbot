import React from "react";

import { Stack } from "@mui/material";

import DiagramGeneratedJsonFilesTable from "./DiagramGeneratedJsonFilesTable";

interface ProjectGeneratedJsonFilesTabProps {}

const ProjectGeneratedJsonFilesTabComponent = (_: ProjectGeneratedJsonFilesTabProps) => {
    return (
        <Stack
            direction="column"
            spacing={1}
        >
            <DiagramGeneratedJsonFilesTable />
        </Stack>
    );
};

export default React.memo(ProjectGeneratedJsonFilesTabComponent);
