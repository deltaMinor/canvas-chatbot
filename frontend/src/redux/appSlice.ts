import { createSlice } from "@reduxjs/toolkit";

import type { AppReducer, AppState } from "#root/interfaces/redux";

export const ERROR_FALLBACK_COUNTDOWN_DURATION = 300;

export type { AppReducer, AppState } from "#root/interfaces/redux";

const initialState: AppState = {
    errorDetails: [],
    secondsLeft: ERROR_FALLBACK_COUNTDOWN_DURATION,
};

const reducers = {
    setErrorDetails(state, action) {
        if (state.errorDetails !== action.payload) {
            state.errorDetails = action.payload;
        }
    },
    setSecondsLeft(state, action) {
        if (state.secondsLeft !== action.payload) {
            state.secondsLeft = action.payload;
        }
    },
    decrementSecondsLeft(state) {
        if (state.secondsLeft > 0) {
            state.secondsLeft -= 1;
        }
    },
    resetSecondsLeft(state, action) {
        const nextSeconds = action.payload ?? ERROR_FALLBACK_COUNTDOWN_DURATION;
        if (state.secondsLeft !== nextSeconds) {
            state.secondsLeft = nextSeconds;
        }
    },
} satisfies AppReducer;

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers,
});

export default appSlice;
