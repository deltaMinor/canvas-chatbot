import React from "react";

import { useDiagramDraftNode, useDiagramDraftNodeLoaded } from "#root/hooks/diagram";

import { useIsNodeEditable } from "./useIsNodeEditable";

export const useIsNodeDeletable = () => {
    const draftNode = useDiagramDraftNode();
    const draftNodeLoaded = useDiagramDraftNodeLoaded();
    const isNodeEditable = useIsNodeEditable(draftNode);

    return React.useMemo(
        () => draftNodeLoaded && isNodeEditable && !!draftNode?.deletable,
        [draftNode?.deletable, draftNodeLoaded, isNodeEditable]
    );
};
