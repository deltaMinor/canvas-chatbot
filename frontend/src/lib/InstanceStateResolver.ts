export class InstanceStateResolver {
    static resolve<TState>({
        instances,
        instanceId,
        createInitialState,
    }: {
        instances: Record<string, TState | undefined>;
        instanceId: string | undefined;
        createInitialState: () => TState;
    }): TState {
        const requestedInstanceState = instanceId ? instances[instanceId] : undefined;

        if (requestedInstanceState) {
            return requestedInstanceState;
        }

        return createInitialState();
    }
}
