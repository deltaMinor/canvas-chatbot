import React from "react";

import { useProjectDiagram } from "#root/hooks/backendHooks";
import {
    getWarningListFromMapping,
    getWarningListMapping,
} from "#root/utils/diagram/diagramWarningUtil";

import {
    useArchitectureNodes,
    useDiagramDraftCanvasId,
    useDiagramWarningFilterKey,
    useDiagramWarningList,
    useDiagramWarningListMapping,
    useDiagramWarningSortDirection,
    useSetDiagramWarningList,
} from "../projectDiagramFeatureHooks";

export const useDiagramWarningListEffect = () => {
    const projectDiagram = useProjectDiagram();
    const architectureNodes = useArchitectureNodes();
    const selectedCanvasId = useDiagramDraftCanvasId() ?? "";
    const warningFilterKey = useDiagramWarningFilterKey();
    const warningListMapping = useDiagramWarningListMapping();
    const warningSortDirection = useDiagramWarningSortDirection();
    const warningList = useDiagramWarningList();
    const setDiagramWarningList = useSetDiagramWarningList();
    const fallbackWarningListMapping = React.useMemo(
        () =>
            getWarningListMapping({
                projectDiagram,
                architectureNodes,
            }),
        [architectureNodes, projectDiagram]
    );

    const effectiveWarningListMapping = React.useMemo(() => {
        return Object.keys(warningListMapping || {}).length > 0
            ? warningListMapping
            : fallbackWarningListMapping;
    }, [fallbackWarningListMapping, warningListMapping]);

    const nextWarningList = React.useMemo(
        () =>
            getWarningListFromMapping({
                ...(selectedCanvasId ? { canvas_id: selectedCanvasId } : {}),
                warningFilterKey,
                warningListMapping: effectiveWarningListMapping,
                warningSortDirection,
            }),
        [effectiveWarningListMapping, selectedCanvasId, warningFilterKey, warningSortDirection]
    );

    const nextWarningListJson = React.useMemo(
        () => JSON.stringify(nextWarningList),
        [nextWarningList]
    );
    const warningListJson = React.useMemo(() => JSON.stringify(warningList), [warningList]);

    React.useEffect(() => {
        if (nextWarningListJson === warningListJson) {
            return;
        }

        setDiagramWarningList(nextWarningList);
    }, [nextWarningList, nextWarningListJson, setDiagramWarningList, warningListJson]);
};
