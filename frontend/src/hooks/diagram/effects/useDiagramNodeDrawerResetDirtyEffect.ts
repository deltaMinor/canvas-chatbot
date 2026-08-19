import React from "react";

import { useDiagramDrawerState, useSetDiagramNodeDrawerDirty } from "../projectDiagramFeatureHooks";

export const useDiagramNodeDrawerResetDirtyEffect = () => {
    const drawerState = useDiagramDrawerState();
    const setDiagramNodeDrawerDirty = useSetDiagramNodeDrawerDirty();
    const isOpen = !!drawerState.node_info;
    const previousIsOpenRef = React.useRef(isOpen);

    React.useEffect(() => {
        if (previousIsOpenRef.current !== isOpen) {
            setDiagramNodeDrawerDirty(false);
        }

        previousIsOpenRef.current = isOpen;
    }, [isOpen, setDiagramNodeDrawerDirty]);
};
