import React from "react";

import { InitializerProps, SharedInitializer } from "#root/components/SharedInitializer";
import { useProjectDiagramFilePdfLoader } from "#root/hooks/backendLoaderHooks";

const ProjectDiagramFilePdfInitializerComponent = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
}: InitializerProps) => {
    const loader = useProjectDiagramFilePdfLoader();

    return (
        <SharedInitializer
            blocking={blocking}
            enabled={enabled}
            refreshOnMount={refreshOnMount}
            skip_fetch={skip_fetch}
            loader={loader}
        >
            {children}
        </SharedInitializer>
    );
};

export const ProjectDiagramFilePdfInitializer = React.memo(
    ProjectDiagramFilePdfInitializerComponent
);
export default ProjectDiagramFilePdfInitializer;
