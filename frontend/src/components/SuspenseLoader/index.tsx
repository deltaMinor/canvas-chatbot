import React from "react";

import { Box, LinearProgress } from "@mui/material";
import NProgress from "nprogress";

const SuspenseLoaderComponent = () => {
    React.useEffect(() => {
        NProgress.start();

        return () => {
            NProgress.done();
        };
    }, []);

    return (
        <Box className="h-full w-full">
            <LinearProgress />
        </Box>
    );
};

export default SuspenseLoaderComponent;
