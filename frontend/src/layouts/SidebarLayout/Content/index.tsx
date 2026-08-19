import React from "react";
import { Outlet } from "react-router-dom";

import { Stack } from "@mui/material";

const ContentComponent = () => {
    return (
        <Stack
            id="Content__Stack"
            className="flex-1 overflow-auto"
            direction="column" //
            justifyContent="flex-start"
            alignItems="stretch"
        >
            <Outlet />
        </Stack>
    );
};

export default React.memo(ContentComponent);
