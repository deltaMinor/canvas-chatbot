import React from "react";

import { useProjectDiagram } from "#root/hooks/backendHooks";
import { getWarningListMapping } from "#root/utils/diagram/diagramWarningUtil";

import {
    useArchitectureNodes,
    useDiagramWarningListMapping,
    useSetDiagramWarningListMapping,
} from "../projectDiagramFeatureHooks";

export const useDiagramWarningListMappingEffect = () => {
    const projectDiagram = useProjectDiagram();
    const architectureNodes = useArchitectureNodes();
    const warningListMapping = useDiagramWarningListMapping();
    const setDiagramWarningListMapping = useSetDiagramWarningListMapping();

    const nextWarningListMapping = React.useMemo(
        () =>
            getWarningListMapping({
                projectDiagram,
                architectureNodes,
            }),
        [architectureNodes, projectDiagram]
    );

    const nextWarningListMappingJson = React.useMemo(
        () => JSON.stringify(nextWarningListMapping),
        [nextWarningListMapping]
    );
    const warningListMappingJson = React.useMemo(
        () => JSON.stringify(warningListMapping),
        [warningListMapping]
    );

    React.useEffect(() => {
        if (nextWarningListMappingJson === warningListMappingJson) {
            return;
        }

        setDiagramWarningListMapping(nextWarningListMapping);
    }, [
        nextWarningListMapping,
        nextWarningListMappingJson,
        setDiagramWarningListMapping,
        warningListMappingJson,
    ]);
};
