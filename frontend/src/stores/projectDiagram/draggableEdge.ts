import React from "react";

import { LineSegment } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import {
    selectDiagramEdgeSegmentedPaths,
    selectDiagramLineSegments,
} from "#root/selectors/projectDiagramFeatureSelectors";
import { getDiagramEdgeSegmentedPath } from "#root/utils/diagram/diagramSelectionUtil";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramLineSegmentsFromStore = (
    instanceId: string
): Record<string, LineSegment[]> => {
    return selectDiagramLineSegments(getRootStateFromStore(), instanceId);
};

export const setDiagramLineSegments = (
    value: React.SetStateAction<Record<string, LineSegment[]>>,
    instanceId: string
) => {
    const currentValue = getDiagramLineSegmentsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setLineSegments(getInstanceValuePayloadFromStore(nextValue, instanceId))
    );
};

export const getDiagramEdgeSegmentedPathsFromStore = (
    instanceId: string
): Record<string, string> => {
    return selectDiagramEdgeSegmentedPaths(getRootStateFromStore(), instanceId);
};

export const getDiagramEdgeSegmentedPathFromStore = (
    edgeId: string,
    instanceId: string
): string => {
    return getDiagramEdgeSegmentedPath(
        selectDiagramEdgeSegmentedPaths(getRootStateFromStore(), instanceId),
        edgeId
    );
};

export const setDiagramEdgeSegmentedPaths = (
    value: React.SetStateAction<Record<string, string>>,
    instanceId: string
) => {
    const currentValue = getDiagramEdgeSegmentedPathsFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setEdgeSegmentedPaths(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};

export const setDiagramEdgeSegmentedPath = (
    edgeId: string,
    value: React.SetStateAction<string>,
    instanceId: string
) => {
    setDiagramEdgeSegmentedPaths((previousPaths) => {
        const currentValue = previousPaths[edgeId] ?? "";
        const nextValue = resolveNextStateAction(value, currentValue);

        if (nextValue === currentValue) {
            return previousPaths;
        }

        return {
            ...previousPaths,
            [edgeId]: nextValue,
        };
    }, instanceId);
};
