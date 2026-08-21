import React from "react";

import { Stack } from "@mui/material";

import DiagramHeaderWrapper from "./DiagramHeaderWrapper";

const DiagramHeaderBodyComponent = () => {
    return (
        <DiagramHeaderWrapper>
            <Stack
                direction="row" //
                justifyContent="space-between"
                alignItems="center"
                className="h-full w-full"
            >
                <div></div>
                <Stack />
            </Stack>
        </DiagramHeaderWrapper>
    );
};

export default React.memo(DiagramHeaderBodyComponent);
