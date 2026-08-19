import React from "react";

import { Stack, StackProps } from "@mui/material";

const defaultStyle = {
    //
};

interface PageStackProps extends StackProps {
    children?: React.ReactNode;
}

const PageStack = ({
    children, //
    style: props__style = {},
    className: props__className = "",
    ...props
}: PageStackProps) => {
    return (
        <Stack
            id="PageStack" //
            style={{
                ...defaultStyle, //
                ...props__style,
            }}
            className={"w-full flex-1" + ` ${props__className}`}
            {...props}
        >
            {children}
        </Stack>
    );
};

export default React.memo(PageStack);
