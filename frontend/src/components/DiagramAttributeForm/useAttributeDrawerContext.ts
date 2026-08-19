import React from "react";

export interface AttributeDrawerContextValue {
    tabValue: number;
    handleTabChange: (_event: React.SyntheticEvent, newValue: string | number) => void;
    handleCancelForm: () => Promise<void> | void;
}

export const AttributeDrawerContext = React.createContext<AttributeDrawerContextValue | null>(null);

export const useAttributeDrawerContext = () => {
    const context = React.useContext(AttributeDrawerContext);

    if (!context) {
        throw new Error(
            "AttributeDrawer compound components must be used within AttributeDrawer.Root"
        );
    }

    return context;
};
