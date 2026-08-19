import React from "react";

import { Card } from "@mui/material";

interface DataGridAdvancedToolbarProps {
    children?: React.ReactNode;
}

const DataGridAdvancedToolbarComponent = ({
    children, //
}: DataGridAdvancedToolbarProps) => {
    return (
        <Card
            variant="outlined" //
            className="mb-1 rounded p-1 shadow-none"
        >
            {children}
        </Card>
    );
};

export default React.memo(DataGridAdvancedToolbarComponent);
