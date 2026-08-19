import React from "react";

import { Breakpoint, Card, CardContent, Container } from "@mui/material";

import MuiCardHeader from "#root/components/MuiCardHeader";
import { colors } from "#root/theme/PureLightTheme";

interface PageCardWrapperProps {
    children?: React.ReactNode;
    maxWidth?: Breakpoint;
    title: string;
}

const PageCardWrapperComponent = ({
    children,
    maxWidth, //
    title,
}: PageCardWrapperProps) => {
    return (
        <Container maxWidth={maxWidth ?? "md"}>
            <Card className="m-4">
                <MuiCardHeader
                    title={title} //
                    variant="h3"
                    align="center"
                    sx={{
                        backgroundColor: colors.primary.main, //
                    }}
                />
                <CardContent
                    className="p-4" //
                >
                    {children}
                </CardContent>
            </Card>
        </Container>
    );
};

export default React.memo(PageCardWrapperComponent);
