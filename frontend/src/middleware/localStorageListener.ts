import { createListenerMiddleware } from "@reduxjs/toolkit";

/**
 * Central place for Redux -> localStorage persistence.
 *
 * Add new listeners here when a piece of Redux state must be persisted
 * to user-scoped localStorage after state changes.
 */
export const localStorageListenerMiddleware = createListenerMiddleware();

localStorageListenerMiddleware.startListening({
    predicate: (_action, _currentState, _previousState) => {
        return true;
    },
    effect: async (_action, _listenerApi) => {},
});
