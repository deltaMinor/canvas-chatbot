import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Stack } from "@mui/material";

import { DEFAULT_PROJECT_ID } from "#root/constants/project";
import { KbToscaInitializer } from "#root/initializers/KbToscaInitializer";
import { ProjectDiagramInitializer } from "#root/initializers/ProjectDiagramInitializer";
import { ProjectInitializer } from "#root/initializers/ProjectInitializer";
import { getStoredMockUserProjectId } from "#root/lib/mockUser";

import FeatureGate from "../components/FeatureGate";
import DiagramContent from "../features/DiagramContent";
import {
    useKbToscaLoadError,
    useKbToscaLoaded,
    useProjectDiagramLoadError,
    useProjectDiagramLoaded,
} from "../hooks/backendHooks";

const DiagramPageComponent = () => {
    const location = useLocation();
    const projectId = new URLSearchParams(location.search).get("project_id");

    if (!projectId) {
        const fallbackProjectId = getStoredMockUserProjectId() || DEFAULT_PROJECT_ID;
        return (
            <Navigate
                to={`/?project_id=${fallbackProjectId}`}
                replace
            />
        );
    }

    return (
        <ProjectInitializer
            blocking
            refreshOnMount
        >
            <ProjectDiagramInitializer
                blocking
                refreshOnMount
            >
                <KbToscaInitializer
                    blocking
                    refreshOnMount
                >
                    <DiagramPageGate />
                </KbToscaInitializer>
            </ProjectDiagramInitializer>
        </ProjectInitializer>
    );
};

const DiagramPageGate = () => {
    const projectDiagramLoaded = useProjectDiagramLoaded();
    const projectDiagramLoadError = useProjectDiagramLoadError();
    const kbToscaLoaded = useKbToscaLoaded();
    const kbToscaLoadError = useKbToscaLoadError();
    const loaded = !!projectDiagramLoaded && !!kbToscaLoaded;
    const loadError = !!projectDiagramLoadError || !!kbToscaLoadError;

    return (
        <Stack className="relative h-full w-full flex-1">
            <FeatureGate
                loaded={loaded}
                loadError={loadError}
                title="Failed to load diagram data"
                message="ThreatMirror could not load the diagram resources required for this project."
            >
                <DiagramContent />
            </FeatureGate>
        </Stack>
    );
};

export default React.memo(DiagramPageComponent);
