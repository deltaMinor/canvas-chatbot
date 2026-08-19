import React from "react";

import { Container, Paper, Stack } from "@mui/material";

interface FullPageContainerStackProps {
    children?: React.ReactNode;
}

const FullPageContainerStackComponent = ({ children }: FullPageContainerStackProps) => {
    return (
        <Container
            className="h-full" //
        >
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                className="h-full w-full" //
            >
                <Paper //
                    elevation={3}
                    className="w-full"
                >
                    {children}
                </Paper>
            </Stack>
        </Container>
    );
};

export default FullPageContainerStackComponent;
