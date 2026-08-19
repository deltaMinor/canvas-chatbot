import React from "react";

import { AttributeDrawerFormBridge } from "#root/interfaces/attributeDrawer";

interface AttributeDrawerFormBridgeContextValue {
    formBridge: AttributeDrawerFormBridge;
}

export const AttributeDrawerFormBridgeContext =
    React.createContext<AttributeDrawerFormBridgeContextValue | null>(null);

export const useAttributeDrawerFormBridge = () => {
    const context = React.useContext(AttributeDrawerFormBridgeContext);

    if (!context) {
        throw new Error(
            "AttributeDrawer form bridge consumers must be used within AttributeDrawer.Root"
        );
    }

    return context.formBridge;
};
