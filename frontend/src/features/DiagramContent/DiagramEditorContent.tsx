import React from "react";

import AttributeDrawers from "./AttributeDrawers";
import DiagramBody from "./DiagramBody";
import DiagramEditor from "./DiagramEditor";

const DiagramEditorContentComponent = () => {
    return (
        <DiagramBody>
            <DiagramEditor />
            <AttributeDrawers />
        </DiagramBody>
    );
};

export default React.memo(DiagramEditorContentComponent);
