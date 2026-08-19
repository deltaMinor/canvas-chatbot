import { useDebouncedCallback } from "#root/hooks/useDebouncedCallback";
import { setDiagramInTransition } from "#root/stores/projectDiagram/canvas";
import { setDiagramView } from "#root/stores/projectDiagram/joyride";

import { useDiagramInTransition, useJoyrideView } from "./projectDiagramFeatureHooks";

export const useStartDiagramTutorial = () => {
    const joyrideView = useJoyrideView();
    const inTransition = useDiagramInTransition();

    const { debouncedCallback: startDiagramTutorial } = useDebouncedCallback(
        () => {
            setDiagramView("joyride");
        },
        180,
        {
            preAction: () => {
                if (inTransition || joyrideView) {
                    return;
                }

                setDiagramInTransition(true);
            },
        }
    );

    return startDiagramTutorial;
};

export default useStartDiagramTutorial;
