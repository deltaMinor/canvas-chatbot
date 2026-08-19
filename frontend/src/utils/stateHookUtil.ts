import React from "react";

import { useRootSelector } from "#root/hooks/useRootSelector";

type StateActionCreator<T> = (payload: T) => { type: string; payload: T };

const resolveNextStateAction = <T>(value: React.SetStateAction<T>, currentValue: T): T => {
    return typeof value === "function" ? (value as (previousValue: T) => T)(currentValue) : value;
};

export const createStateHook = <RootState, State, K extends keyof State>(
    selectState: (rootState: RootState) => State,
    key: K
): (() => State[K]) => {
    return () => useRootSelector((rootState) => selectState(rootState as RootState)[key]);
};

export const createSetStateHook = <State, K extends keyof State, A extends string>(
    getState: () => State,
    dispatch: (action: { type: string; payload: State[K] }) => void,
    actions: Record<A, unknown>,
    key: K,
    actionKey: A
) => {
    return () =>
        React.useMemo(() => {
            const action = actions[actionKey] as unknown as StateActionCreator<State[K]>;

            return (value: React.SetStateAction<State[K]>) => {
                const currentValue = getState()[key];
                const nextValue = resolveNextStateAction(value, currentValue);
                dispatch(action(nextValue));
            };
        }, []);
};
