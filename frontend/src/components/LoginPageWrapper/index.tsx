import React from "react";

import { Card, CardContent, Container, Stack } from "@mui/material";

import MuiCardHeader from "#root/components/MuiCardHeader";

interface LoginPageWrapperProps {
    title: string;
    children?: React.ReactNode;
}

const LoginPageWrapperComponent = ({
    title, //
    children,
}: LoginPageWrapperProps) => {
    return (
        <Container
            id="LoginPageWrapperComponent" //
            component="main"
            maxWidth="sm"
            fixed
            className="h-full" //
        >
            <Stack
                direction="column" //
                justifyContent="center"
                alignItems="center"
                className="h-full" //
            >
                <Card //
                    className="w-full"
                >
                    <MuiCardHeader
                        title={title} //
                        variant="h1"
                        align="center"
                    />
                    <CardContent //
                        className="p-6"
                    >
                        {children}
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
};

export default React.memo(LoginPageWrapperComponent);
