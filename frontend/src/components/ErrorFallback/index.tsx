import React from "react";
import { FallbackProps } from "react-error-boundary";
import { useDispatch, useStore } from "react-redux";

import { ERROR_FALLBACK_COUNTDOWN_DURATION } from "#root/redux/appSlice";
import { AppDispatch, RootState, app_actions } from "#root/redux/store";

import ErrorFallbackBody from "./ErrorFallbackBody";

interface ErrorFallbackProps extends FallbackProps {}

const ErrorFallbackComponent = (props: ErrorFallbackProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();

    React.useEffect(() => {
        dispatch(app_actions.app.resetSecondsLeft(ERROR_FALLBACK_COUNTDOWN_DURATION));
    }, [dispatch]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            const state = store.getState();
            const secondsLeft = state?.app?.secondsLeft ?? 0;

            if (secondsLeft <= 1) {
                window.location.reload();
                return;
            }

            dispatch(app_actions.app.decrementSecondsLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [dispatch, store]);

    return (
        <ErrorFallbackBody //
            {...props}
        />
    );
};

export default React.memo(ErrorFallbackComponent);
