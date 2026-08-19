import React from "react";

import { Stack } from "@mui/material";

import ProjectPdfFilesTable from "./DiagramPdfFilesTable";

interface ProjectPdfFilesTabProps {}

const ProjectPdfFilesTabComponent = (_: ProjectPdfFilesTabProps) => {
    return (
        <Stack
            direction="column"
            spacing={1}
        >
            <ProjectPdfFilesTable />
        </Stack>
    );
};

export default React.memo(ProjectPdfFilesTabComponent);
