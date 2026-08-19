import React from "react";

import CircularProgress from "@mui/material/CircularProgress";

const MuiFloatingLoadIcon = () => {
    return (
        <CircularProgress
            sx={{
                position: "absolute",
                bottom: 25,
                right: 50,
                zIndex: 1400,
            }}
        />
    );
};

export default React.memo(MuiFloatingLoadIcon);
