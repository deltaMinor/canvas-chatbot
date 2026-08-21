import React from "react";

import { Panel } from "@xyflow/react";

import DiagramControls from "#root/components/DiagramControls";
import DiagramMiniMap from "#root/components/DiagramMiniMap";
import DiagramWarningFab from "#root/components/DiagramWarningFab";
import DiagramZoomSlider from "#root/components/DiagramZoomSlider";

const DiagramEditorPanels = () => {
    return (
        <>
            <Panel
                className="m-2"
                position="top-right"
            >
                <DiagramWarningFab />
            </Panel>
            <Panel
                className="m-1"
                position="bottom-center"
            >
                <DiagramZoomSlider />
            </Panel>
            <DiagramControls />
            <Panel
                className="m-1"
                position="bottom-left"
            >
                <DiagramMiniMap />
            </Panel>
        </>
    );
};

export default React.memo(DiagramEditorPanels);
