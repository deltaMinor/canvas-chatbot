import { createSlice } from "@reduxjs/toolkit";

import type { AppVersionFeatureReducer, AppVersionFeatureState } from "#root/interfaces/redux";

export type { AppVersionFeatureReducer, AppVersionFeatureState } from "#root/interfaces/redux";

const initialState: AppVersionFeatureState = {
    currentIndex: 0,
    appVersionDialogLoaded: false,
};

const reducers = {
    setCurrentIndex(state, action) {
        if (state.currentIndex !== action.payload) {
            state.currentIndex = action.payload;
        }
    },
    setAppVersionDialogLoaded(state, action) {
        if (state.appVersionDialogLoaded !== action.payload) {
            state.appVersionDialogLoaded = action.payload;
        }
    },
} satisfies AppVersionFeatureReducer;

const appVersionFeatureSlice = createSlice({
    name: "appVersionFeature",
    initialState,
    reducers,
});

export default appVersionFeatureSlice;
