import React from "react";

import { Box } from "@mui/material";

interface PageBoxProps {
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const PageBoxComponent = ({
    children, //
    style = {},
}: PageBoxProps) => {
    return (
        <Box
            sx={{
                backgroundColor: "rgb(242, 245, 249)",
            }}
            style={{ ...style }}
            className="px-2 py-1"
        >
            {children}
        </Box>
    );
};

export default React.memo(PageBoxComponent);
