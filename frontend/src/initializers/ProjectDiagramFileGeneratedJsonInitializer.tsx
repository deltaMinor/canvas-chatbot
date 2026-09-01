import React from "react";

import { InitializerProps, SharedInitializer } from "#root/components/SharedInitializer";
import { useProjectDiagramFileGeneratedJsonLoader } from "#root/hooks/backendLoaderHooks";

const ProjectDiagramFileGeneratedJsonInitializerComponent = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
}: InitializerProps) => {
    const loader = useProjectDiagramFileGeneratedJsonLoader();

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

export const ProjectDiagramFileGeneratedJsonInitializer = React.memo(
    ProjectDiagramFileGeneratedJsonInitializerComponent
);
export default ProjectDiagramFileGeneratedJsonInitializer;
