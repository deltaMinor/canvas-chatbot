import React from "react";

import { Stack } from "@mui/material";

import Content from "./Content";
import Header from "./Header";

const SidebarLayout = () => {
    return (
        <Stack
            id="SidebarLayout" //
            component="main"
            className="h-[calc(100vh)] w-[100vw] max-w-[100vw]" //
        >
            <Header />
            {/* <Sidebar /> */}
            <Content />
        </Stack>
    );
};

export default React.memo(SidebarLayout);
