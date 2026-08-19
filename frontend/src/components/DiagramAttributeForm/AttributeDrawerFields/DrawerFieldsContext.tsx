import React from "react";

import {
    DrawerFieldsContextInterface,
    DrawerFieldsContextProviderProps,
} from "#root/interfaces/attributeDrawer";

export const DrawerFieldsContext = React.createContext<DrawerFieldsContextInterface>(
    {} as DrawerFieldsContextInterface
);

export const DrawerFieldsContextProvider = ({
    children,
    contextRef,
    refKey,
    //
    attributeSetType,
    disable_add,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
    property,
}: DrawerFieldsContextProviderProps) => {
    const value = React.useMemo(
        () => ({
            attributeSetType,
            disable_add,
            handleAddAttribute, //
            handleRemoveLocal,
            handleRenewAttribute,
            property,
        }),
        [
            attributeSetType,
            disable_add,
            handleAddAttribute,
            handleRemoveLocal,
            handleRenewAttribute,
            property,
        ]
    );

    React.useEffect(() => {
        if (!contextRef?.current) return;
        contextRef.current.drawerFieldsContext[refKey] = value;
    }, [contextRef, refKey, value]);

    return (
        <DrawerFieldsContext.Provider //
            value={value}
        >
            {children}
        </DrawerFieldsContext.Provider>
    );
};
