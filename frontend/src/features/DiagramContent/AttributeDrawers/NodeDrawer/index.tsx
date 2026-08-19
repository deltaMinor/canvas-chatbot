import React from "react";

import DiagramNodeDrawerEffects from "#root/effects/DiagramNodeDrawerEffects";

import NodeDrawerContent from "./NodeDrawerContent";

const NodeDrawerComponent = () => {
    return (
        <>
            <DiagramNodeDrawerEffects />
            <NodeDrawerContent />
        </>
    );
};

export default React.memo(NodeDrawerComponent);
