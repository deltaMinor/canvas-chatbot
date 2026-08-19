import React from "react";

import { useTheme } from "@mui/material";

interface ColouredBarProps {
    backgroundColor: string;
}

const ColouredBarComponent = ({
    backgroundColor, //
}: ColouredBarProps) => {
    const theme = useTheme();
    return (
        <div
            style={{
                height: theme.spacing(0.5),
                borderRadius: theme.spacing(0.5),
                width: "90%",
                margin: "auto",
                backgroundColor: backgroundColor,
            }}
        />
    );
};

export default React.memo(ColouredBarComponent);
