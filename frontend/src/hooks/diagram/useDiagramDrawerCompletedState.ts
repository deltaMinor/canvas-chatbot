import React from "react";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { useProjectDiagram } from "#root/hooks/backendHooks";
import { getProjectDiagramFromStore } from "#root/stores/backendStore";
import { getIsProjectCqCompletedFromStore } from "#root/stores/projectDiagram/canvas";
import { getDiagramViewFromStore } from "#root/stores/projectDiagram/joyride";

import { useJoyrideView } from "./projectDiagramFeatureHooks";
import { useIsProjectCqCompleted } from "./useIsProjectCqCompleted";

/**
 * True when the diagram is completed (AD submitted) OR the CQ has not yet
 * been submitted. Joyride overrides this to false so the tutorial can
 * demonstrate editing on a freshly created project.
 */
export const useDiagramDrawerIsCompleted = () => {
    const projectDiagram = useProjectDiagram();
    const isCqCompleted = useIsProjectCqCompleted();

    return React.useMemo(
        () => !!projectDiagram?.isCompleted || !isCqCompleted,
        [isCqCompleted, projectDiagram?.isCompleted]
    );
};

export const useDiagramDrawerIsCompletedFromStore = () =>
    React.useMemo(
        () => !!getProjectDiagramFromStore()?.isCompleted || !getIsProjectCqCompletedFromStore(),
        []
    );

export const useDiagramDrawerEffectiveIsCompleted = () => {
    const joyrideView = useJoyrideView();
    const isCompleted = useDiagramDrawerIsCompleted();

    return React.useMemo(() => (joyrideView ? false : isCompleted), [isCompleted, joyrideView]);
};

export const useDiagramDrawerEffectiveIsCompletedFromStore = () => {
    const instanceId = useDiagramInstanceId();
    const diagramView = getDiagramViewFromStore(instanceId);
    const isCompleted = useDiagramDrawerIsCompletedFromStore();

    return React.useMemo(
        () => (diagramView === "joyride" ? false : isCompleted),
        [diagramView, isCompleted]
    );
};

export const getDiagramDrawerIsCompletedFromStore = () =>
    !!getProjectDiagramFromStore()?.isCompleted || !getIsProjectCqCompletedFromStore();

export const getDiagramDrawerEffectiveIsCompletedFromStore = (instanceId: string) => {
    const diagramView = getDiagramViewFromStore(instanceId);
    const isCompleted = getDiagramDrawerIsCompletedFromStore();

    return diagramView === "joyride" ? false : isCompleted;
};
