import React from "react";

import DiagramToolbarEffects from "#root/effects/DiagramToolbarEffects";
import {
    useDiagramSelectedEdgeIdList,
    useDiagramSelectedNodeIdList,
} from "#root/hooks/diagram";

import DiagramHeaderBody from "./DiagramHeaderBody";
import DiagramInitialiseDialog from "./dialogs/DiagramInitialiseDialog";

const DiagramHeaderComponent = () => {
    const selectedEdgeIdList = useDiagramSelectedEdgeIdList();
    const selectedNodeIdList = useDiagramSelectedNodeIdList();

    return (
        <>
            <DiagramToolbarEffects />
            <DiagramInitialiseDialog />
            <DiagramHeaderBody //
                showEditToolbar={selectedNodeIdList.length > 0 || selectedEdgeIdList.length > 0}
            />
        </>
    );
};

export default React.memo(DiagramHeaderComponent);
