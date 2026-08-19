import React from "react";

import { Box, BoxProps } from "@mui/material";

import { colors } from "#root/theme/PureLightTheme";

interface PageCardProps extends BoxProps {}

const PageCardComponent = ({
    children,
    className: props__className = "",
    style: props__style = {},
    ...props
}: PageCardProps) => {
    return (
        <Box
            className={`w-[calc(100%-10px)] rounded border-1 border-solid p-2 ${props__className}`}
            style={{
                backgroundColor: "#fff",
                borderColor: colors.alpha.black[20],
                ...props__style,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default React.memo(PageCardComponent);
