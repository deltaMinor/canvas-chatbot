import React from "react";

import { useDiagramDrawerState, useSetDiagramEdgeDrawerDirty } from "../projectDiagramFeatureHooks";

export const useDiagramEdgeDrawerResetDirtyEffect = () => {
    const drawerState = useDiagramDrawerState();
    const setDiagramEdgeDrawerDirty = useSetDiagramEdgeDrawerDirty();
    const isOpen = !!drawerState.edge_info;
    const previousIsOpenRef = React.useRef(isOpen);

    React.useEffect(() => {
        if (previousIsOpenRef.current !== isOpen) {
            setDiagramEdgeDrawerDirty(false);
        }

        previousIsOpenRef.current = isOpen;
    }, [isOpen, setDiagramEdgeDrawerDirty]);
};
