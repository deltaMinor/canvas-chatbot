import React from "react";

import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import {
    BaseFieldAttribute,
    DiagramElementAttrBaseFieldKey,
    DiagramElementType,
    HandleAddAttribute,
    HandleRemoveLocal,
    HandleRenewAttribute,
} from "#root/interfaces/diagramAttributes";

import DrawerFieldsBody from "./DrawerFieldsBody";
import { DrawerFieldsContextProvider } from "./DrawerFieldsContext";
import { initDrawerFieldsRef } from "./constants";

export interface DrawerFieldsProps {
    attributes: BaseFieldAttribute[];
    attributeSetType: DiagramElementType;
    disable_add?: boolean;
    editable: boolean;
    handleAddAttribute: HandleAddAttribute;
    handleRemoveLocal: HandleRemoveLocal;
    handleRenewAttribute: HandleRenewAttribute;
    property: DiagramElementAttrBaseFieldKey;
    refObject: Record<string, unknown>;
    refKey: string;
}

const DrawerFieldsComponent = ({
    attributes,
    attributeSetType,
    disable_add = false,
    editable,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
    property,
    refKey,
    refObject,
}: DrawerFieldsProps) => {
    const sectionRef = React.useRef<DrawerFieldsRefObject>(initDrawerFieldsRef);

    return (
        <DrawerFieldsContextProvider //
            contextRef={sectionRef}
            attributeSetType={attributeSetType}
            property={property}
            disable_add={disable_add}
            handleAddAttribute={handleAddAttribute}
            handleRemoveLocal={handleRemoveLocal}
            handleRenewAttribute={handleRenewAttribute}
            refKey={refKey}
        >
            <DrawerFieldsBody //
                sectionRef={sectionRef}
                refKey={refKey}
                attributes={attributes}
                editable={editable}
                refObject={refObject}
                disable_add={disable_add}
            />
        </DrawerFieldsContextProvider>
    );
};

export default React.memo(DrawerFieldsComponent);
