import { useDebouncedCallback } from "#root/hooks/useDebouncedCallback";
import { setDiagramInTransition } from "#root/stores/projectDiagram/canvas";
import { setDiagramView } from "#root/stores/projectDiagram/joyride";

import { useDiagramInTransition, useJoyrideView } from "./projectDiagramFeatureHooks";

export const useStopDiagramTutorial = () => {
    const joyrideView = useJoyrideView();
    const inTransition = useDiagramInTransition();

    const { debouncedCallback: stopDiagramTutorial } = useDebouncedCallback(
        () => {
            setDiagramView("editor");
        },
        180,
        {
            preAction: () => {
                if (inTransition || !joyrideView) {
                    return;
                }

                setDiagramInTransition(true);
            },
        }
    );

    return stopDiagramTutorial;
};

export default useStopDiagramTutorial;
