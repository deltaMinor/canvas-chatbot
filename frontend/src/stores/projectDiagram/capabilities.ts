import { DiagramCapabilitiesState } from "#root/interfaces/redux";
import app_store, { app_actions } from "#root/redux/store";
import { selectDiagramCapabilities } from "#root/selectors/projectDiagramFeatureSelectors";
import { getInstanceValuePayloadFromStore } from "#root/utils/diagram/diagramStoreUtil";

import { getRootStateFromStore } from "../root";

export const getDiagramCapabilitiesFromStore = (instanceId: string): DiagramCapabilitiesState =>
    selectDiagramCapabilities(getRootStateFromStore(), instanceId);

export const setDiagramCapabilities = (
    capabilities: DiagramCapabilitiesState,
    instanceId: string
) => {
    app_store.dispatch(
        app_actions.diagram.setCapabilities(
            getInstanceValuePayloadFromStore(capabilities, instanceId)
        )
    );
};
