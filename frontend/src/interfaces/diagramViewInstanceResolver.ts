import { UnknownAction } from "@reduxjs/toolkit";

export type ListenerApiLike = {
    getState: () => unknown;
    dispatch: (action: UnknownAction) => unknown;
};
