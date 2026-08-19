import React from "react";

import { Container, Paper, Stack } from "@mui/material";

interface ContainerStackProps {
    children?: React.ReactNode;
}

const ContainerStackComponent = ({
    children, //
}: ContainerStackProps) => {
    return (
        <Container
            className="m-0 h-full w-full max-w-full p-0" //
            id="ContainerStackComponent"
        >
            <Paper //
                elevation={0}
                className="w-full"
            >
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    className="h-full w-full" //
                >
                    <div //
                        className="w-full max-w-[800px]"
                    >
                        {children}
                    </div>
                </Stack>
            </Paper>
        </Container>
    );
};

export default React.memo(ContainerStackComponent);
