import {
    ensureProjectFeatureInstanceId,
    resolveProjectFeatureInstanceId,
} from "#root/utils/projectInstanceId";

interface ProjectFeatureState<TInstanceState> {
    instances: Record<string, TInstanceState>;
}

export const createProjectFeatureSliceHelpers = <
    TInstanceState,
    TState extends ProjectFeatureState<TInstanceState>,
>(
    featureKey: string,
    createInitialInstanceState: () => TInstanceState
) => {
    const getResolvedInstanceId = (instanceId?: string) =>
        ensureProjectFeatureInstanceId({
            featureKey,
            instanceId,
        });

    const getExistingInstanceId = (instanceId?: string) => {
        return resolveProjectFeatureInstanceId({
            featureKey,
            instanceId,
        });
    };

    const ensureInstance = (state: TState, instanceId?: string) => {
        const resolvedInstanceId = getExistingInstanceId(instanceId);

        if (!state.instances[resolvedInstanceId]) {
            state.instances[resolvedInstanceId] = createInitialInstanceState();
        }

        return state.instances[resolvedInstanceId];
    };

    return {
        ensureInstance,
        getExistingInstanceId,
        getResolvedInstanceId,
    };
};
