const stringifyForCompare = (value: unknown) => {
    try {
        return JSON.stringify(value);
    } catch {
        return undefined;
    }
};

export const updateExternalStateIfChanged = <
    TState extends Record<string, unknown>,
    TKey extends keyof TState,
>(
    currentValue: TState[TKey],
    nextValue: TState[TKey],
    instanceId: string,
    key: TKey,
    updateExternalState: (instanceId: string, state: Partial<TState>) => void
) => {
    const isEqual =
        typeof currentValue === "boolean" || typeof currentValue === "string"
            ? currentValue === nextValue
            : stringifyForCompare(currentValue) === stringifyForCompare(nextValue);

    if (isEqual) {
        return;
    }

    const changedState = {
        [key]: nextValue,
    } as unknown as Partial<TState>;
    updateExternalState(instanceId, changedState);
};
