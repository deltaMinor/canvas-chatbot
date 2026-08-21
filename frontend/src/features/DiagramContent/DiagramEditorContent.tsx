import React from "react";

import DiagramBody from "./DiagramBody";
import DiagramEditor from "./DiagramEditor";

const DiagramEditorContentComponent = () => {
    return (
        <DiagramBody>
            <DiagramEditor />
        </DiagramBody>
    );
};

export default React.memo(DiagramEditorContentComponent);
