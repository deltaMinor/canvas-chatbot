import React from "react";

import { setDiagramInTransition } from "#root/stores/projectDiagram/canvas";

import { useJoyrideView } from "../projectDiagramFeatureHooks";

export const useJoyrideTransitionEffect = () => {
    const joyrideView = useJoyrideView();
    const previousJoyrideViewRef = React.useRef(joyrideView);
    const transitionTimeoutRef = React.useRef<number | null>(null);

    const clearTransitionTimeout = React.useCallback(() => {
        if (transitionTimeoutRef.current !== null) {
            window.clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
    }, []);

    const hideJoyrideTransitionAfterDelay = React.useCallback(
        (delay: number) => {
            clearTransitionTimeout();
            transitionTimeoutRef.current = window.setTimeout(() => {
                setDiagramInTransition(false);
                transitionTimeoutRef.current = null;
            }, delay);
        },
        [clearTransitionTimeout]
    );

    React.useEffect(() => {
        if (previousJoyrideViewRef.current === joyrideView) {
            return;
        }

        previousJoyrideViewRef.current = joyrideView;

        hideJoyrideTransitionAfterDelay(joyrideView ? 220 : 360);
    }, [hideJoyrideTransitionAfterDelay, joyrideView]);

    React.useEffect(() => {
        return () => {
            clearTransitionTimeout();
        };
    }, [clearTransitionTimeout]);
};

export default useJoyrideTransitionEffect;
