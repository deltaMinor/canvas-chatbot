import React from "react";

import { Breakpoint, Container, ContainerProps } from "@mui/material";

const defaultStyle = {
    //
};

interface PageContainerProps extends ContainerProps {
    children?: React.ReactNode;
    maxWidth?: false | Breakpoint;
}

const PageContainer = ({
    children, //
    style: props__style = {},
    maxWidth: props__maxWidth,
    className: props__className = "",
    ...props
}: PageContainerProps) => {
    return (
        <Container //
            id="PageContainer"
            maxWidth={props__maxWidth || false}
            style={{
                ...defaultStyle, //
                ...props__style,
            }}
            className={"w-full flex-1 p-1" + ` ${props__className}`}
            {...props}
        >
            {children}
        </Container>
    );
};

export default React.memo(PageContainer);
