import React from "react";

import EdgeDrawer from "./EdgeDrawer";
import NodeDrawer from "./NodeDrawer";
import RequestToFillRequiredFieldsDialog from "./dialogs/RequestToFillRequiredFieldsDialog";

const AttributeDrawersComponent = () => {
    return (
        <>
            <EdgeDrawer />
            <NodeDrawer />
            <RequestToFillRequiredFieldsDialog //
            />
        </>
    );
};

export default React.memo(AttributeDrawersComponent);
