import React from "react";

import DiagramEdgeDrawerEffects from "#root/effects/DiagramEdgeDrawerEffects";

import EdgeDrawerContent from "./EdgeDrawerContent";

const EdgeDrawerComponent = () => {
    return (
        <>
            <DiagramEdgeDrawerEffects />
            <EdgeDrawerContent />
        </>
    );
};

export default React.memo(EdgeDrawerComponent);
