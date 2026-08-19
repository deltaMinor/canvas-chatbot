import React from "react";

import { WarningReport } from "#root/interfaces/diagram";
import app_store, { app_actions } from "#root/redux/store";
import { selectDiagramToscaReportMapping } from "#root/selectors/projectDiagramFeatureSelectors";
import {
    getInstanceValuePayloadFromStore,
    resolveNextStateAction,
} from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramToscaReportMappingFromStore = (
    instanceId: string
): { [id: string]: WarningReport[] } => {
    return selectDiagramToscaReportMapping(getRootStateFromStore(), instanceId);
};

export const setDiagramToscaReportMapping = (
    value: React.SetStateAction<{ [id: string]: WarningReport[] }>,
    instanceId: string
) => {
    const currentValue = getDiagramToscaReportMappingFromStore(instanceId);
    const nextValue = resolveNextStateAction(value, currentValue);

    app_store.dispatch(
        app_actions.diagram.setToscaReportMapping(
            getInstanceValuePayloadFromStore(nextValue, instanceId)
        )
    );
};
