import React from "react";
import { useLocation } from "react-router-dom";

import { InitializerProps, SharedInitializer } from "#root/components/SharedInitializer";
import { ProjectLoader } from "#root/services/loader/ProjectLoader";

const ProjectInitializerComponent = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
}: InitializerProps) => {
    const location = useLocation();
    const routeProjectId = React.useMemo(
        () => new URLSearchParams(location.search).get("project_id") ?? "",
        [location.search]
    );
    const loader = React.useMemo(() => new ProjectLoader(routeProjectId), [routeProjectId]);

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

export const ProjectInitializer = React.memo(ProjectInitializerComponent);
export default ProjectInitializer;
