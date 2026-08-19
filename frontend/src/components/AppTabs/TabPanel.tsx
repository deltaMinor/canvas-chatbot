import React from "react";

import { Box } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    backgroundColor: string;
}

const TabPanelComponent: React.FC<TabPanelProps> = ({ children, backgroundColor }) => {
    return (
        <Box
            className="mt-1 p-1"
            style={{ backgroundColor }} //
        >
            {children}
        </Box>
    );
};

export default TabPanelComponent;
