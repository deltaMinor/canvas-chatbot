import React from "react";
import { useDispatch } from "react-redux";

import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { DiagramInstanceState } from "#root/redux/projectDiagramFeatureSlice";
import { AppDispatch, app_actions } from "#root/redux/store";
import { getInitialDiagramCanvasStateFromStore } from "#root/stores/projectDiagram/backend";

interface UseInitDiagramInstanceEffectParams {
    initialState: Partial<DiagramInstanceState> | undefined;
}

export const useInitDiagramInstanceEffect = ({
    initialState,
}: UseInitDiagramInstanceEffectParams) => {
    const dispatch = useDispatch<AppDispatch>();
    const instanceId = useDiagramInstanceId();

    React.useEffect(() => {
        dispatch(
            app_actions.diagram.initializeInstance({
                instanceId,
                initialState: {
                    ...getInitialDiagramCanvasStateFromStore(),
                    ...initialState,
                },
            })
        );

        return () => {
            dispatch(app_actions.diagram.removeInstance(instanceId));
        };
    }, [dispatch, initialState, instanceId]);
};

export default useInitDiagramInstanceEffect;
