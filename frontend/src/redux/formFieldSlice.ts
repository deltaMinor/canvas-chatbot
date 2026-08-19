import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { FormFieldFeatureState, FormFieldInstanceState } from "#root/interfaces/redux";
import type {
    FormFieldInstancePayload,
    InitializeFormFieldInstancePayload,
    UpdateFormFieldExternalStatePayload,
} from "#root/interfaces/reduxPayload";

export type {
    FormFieldExternalState,
    FormFieldFeatureState,
    FormFieldInstanceState,
} from "#root/interfaces/redux";

export const createInitialFormFieldInstanceState = (): FormFieldInstanceState => ({
    hideInfoDrawer: false,
    hideUsefulness: false,
    isFieldDisabled: false,
    isInfoDrawerDisabled: false,
    isScenarioDialogDisabled: false,
    loaded: false,
    questionFromSource: undefined,
    useTemplate: false,
});

const initialState: FormFieldFeatureState = {
    instances: {},
};

const getExistingInstanceId = (instanceId?: string) => {
    if (instanceId) {
        return instanceId;
    }

    return "default";
};

const ensureFormFieldInstance = (state: FormFieldFeatureState, instanceId?: string) => {
    const resolvedInstanceId = getExistingInstanceId(instanceId);

    if (!state.instances[resolvedInstanceId]) {
        state.instances[resolvedInstanceId] = createInitialFormFieldInstanceState();
    }

    return state.instances[resolvedInstanceId];
};

const getFormFieldPayload = <T>(
    payload: T | FormFieldInstancePayload<T>
): FormFieldInstancePayload<T> => {
    if (typeof payload === "object" && payload !== null && "value" in payload) {
        return payload as FormFieldInstancePayload<T>;
    }

    return {
        value: payload as T,
    };
};

const formFieldSlice = createSlice({
    name: "formFieldFeature",
    initialState,
    reducers: {
        initializeInstance(state, action: PayloadAction<InitializeFormFieldInstancePayload>) {
            if (!state.instances[action.payload.instanceId]) {
                state.instances[action.payload.instanceId] = {
                    ...createInitialFormFieldInstanceState(),
                    ...action.payload.externalState,
                };
            }
        },
        updateExternalState(state, action: PayloadAction<UpdateFormFieldExternalStatePayload>) {
            const instanceState = ensureFormFieldInstance(state, action.payload.instanceId);

            Object.assign(instanceState, action.payload.externalState);
        },
        removeInstance(state, action: PayloadAction<string>) {
            delete state.instances[action.payload];
        },
        setLoaded(state, action: PayloadAction<boolean | FormFieldInstancePayload<boolean>>) {
            const { instanceId, value } = getFormFieldPayload(action.payload);
            ensureFormFieldInstance(state, instanceId).loaded = value;
        },
        setUseTemplate(state, action: PayloadAction<boolean | FormFieldInstancePayload<boolean>>) {
            const { instanceId, value } = getFormFieldPayload(action.payload);
            ensureFormFieldInstance(state, instanceId).useTemplate = value;
        },
    },
});

export const {
    initializeInstance,
    updateExternalState,
    removeInstance,
    setLoaded,
    setUseTemplate,
} = formFieldSlice.actions;

export default formFieldSlice.reducer;
