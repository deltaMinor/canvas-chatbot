import React from "react";

import DiagramHeaderBody from "./DiagramHeaderBody";
import DiagramInitialiseDialog from "./dialogs/DiagramInitialiseDialog";

const DiagramHeaderComponent = () => {
    return (
        <>
            <DiagramInitialiseDialog />
            <DiagramHeaderBody />
        </>
    );
};

export default React.memo(DiagramHeaderComponent);
