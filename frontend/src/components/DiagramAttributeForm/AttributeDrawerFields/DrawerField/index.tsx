import React from "react";

import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerFieldBody from "./DrawerFieldBody";

interface DrawerFieldProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    refObject: Record<string, unknown>;
    editable: boolean;
    attribute: BaseFieldAttribute;
}

const DrawerFieldComponent = ({
    sectionRef,
    refKey,
    ...props //
}: DrawerFieldProps) => {
    return (
        <>
            <DrawerFieldBody //
                sectionRef={sectionRef}
                refKey={refKey}
                {...props}
            />
        </>
    );
};

export default React.memo(DrawerFieldComponent);
