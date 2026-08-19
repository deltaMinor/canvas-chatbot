import React from "react";

import {
    useDiagramSelectedPath,
    useDiagramView,
    useStartAttackPath,
    useViewAllPaths,
} from "./projectDiagramFeatureHooks";

interface UseShowAttackPathNavigatorParams {
    requirePlaybackToShow: boolean;
    totalSteps: number;
}

export const useShowAttackPathNavigator = ({
    requirePlaybackToShow,
    totalSteps,
}: UseShowAttackPathNavigatorParams) => {
    const diagramView = useDiagramView();
    const selectedPath = useDiagramSelectedPath();
    const startAttackPath = useStartAttackPath();
    const viewAllPaths = useViewAllPaths();

    return React.useMemo(
        () =>
            diagramView === "visualizer" &&
            !!selectedPath &&
            (!requirePlaybackToShow || !!startAttackPath) &&
            !viewAllPaths &&
            totalSteps > 0,
        [
            diagramView,
            selectedPath,
            requirePlaybackToShow,
            startAttackPath,
            totalSteps,
            viewAllPaths,
        ]
    );
};

export default useShowAttackPathNavigator;
