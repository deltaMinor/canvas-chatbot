import React from "react";

import { InitializerProps, SharedInitializer } from "#root/components/SharedInitializer";
import { useProjectDiagramLoader } from "#root/hooks/backendLoaderHooks";

const ProjectDiagramInitializerComponent = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
}: InitializerProps) => {
    const loader = useProjectDiagramLoader();

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

export const ProjectDiagramInitializer = React.memo(ProjectDiagramInitializerComponent);
export default ProjectDiagramInitializer;
