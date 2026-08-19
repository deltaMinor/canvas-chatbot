import React from "react";

import { Box, Container } from "@mui/material";

interface PageTitleWrapperProps {
    children?: React.ReactNode;
}

const PageTitleWrapperComponent = ({
    children, //
}: PageTitleWrapperProps) => {
    return (
        <Box //
            id="PageTitleWrapperComponent"
            className="h-[fit-content]"
        >
            <Container
                id="PageTitleWrapper__Container"
                maxWidth={false}
                className="PageTitle_PageTitle m-auto p-1"
            >
                {children}
            </Container>
        </Box>
    );
};

export default React.memo(PageTitleWrapperComponent);
