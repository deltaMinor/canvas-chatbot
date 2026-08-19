import {
    DiagramInstanceState,
    createInitialDiagramInstanceState,
} from "#root/redux/projectDiagramFeatureSlice";
import { RootState } from "#root/redux/store";
import { resolveProjectFeatureInstanceId } from "#root/utils/projectInstanceId";

export const getDiagramInstanceState = (
    state: RootState,
    instanceId?: string
): DiagramInstanceState => {
    const resolvedInstanceId = resolveProjectFeatureInstanceId({
        featureKey: "diagram",
        instanceId,
    });

    if (state.diagram.instances[resolvedInstanceId]) {
        return state.diagram.instances[resolvedInstanceId];
    }

    return createInitialDiagramInstanceState();
};

export const getDiagramInstanceIds = (state: RootState): string[] => {
    return Object.keys(state.diagram.instances);
};
