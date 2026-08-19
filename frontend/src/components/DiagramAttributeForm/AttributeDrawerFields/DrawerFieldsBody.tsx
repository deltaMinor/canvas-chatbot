import React from "react";

import { List, ListItem } from "@mui/material";

import { nodeDataAttributesVisibleFields } from "#root/constants/diagramAttributes";
import { DrawerFieldsRefObject } from "#root/interfaces/attributeDrawer";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

import DrawerField from "./DrawerField";
import DrawerFieldsFooterItem from "./DrawerFieldsFooterItem";

export interface DrawerFieldsBodyProps {
    sectionRef: React.RefObject<DrawerFieldsRefObject>;
    refKey: string;
    //
    attributes: BaseFieldAttribute[];
    editable: boolean;
    refObject: Record<string, unknown>;
    disable_add?: boolean;
}

const DrawerFieldsBodyComponent = ({
    sectionRef,
    refKey,
    //
    attributes,
    editable,
    refObject,
    disable_add,
}: DrawerFieldsBodyProps) => {
    const visibleAttributes =
        attributes?.filter((attribute) => {
            return nodeDataAttributesVisibleFields.includes(attribute?.key);
        }) ?? [];

    return (
        <List //
            className="diagram-attribute-form__fields-list"
        >
            {visibleAttributes.map((attribute) => {
                return (
                    <ListItem //
                        className="diagram-attribute-form__fields-item"
                        key={attribute?.key}
                    >
                        <DrawerField //
                            sectionRef={sectionRef}
                            refKey={refKey}
                            attribute={attribute}
                            editable={editable}
                            refObject={refObject}
                        />
                    </ListItem>
                );
            })}
            <DrawerFieldsFooterItem //
                sectionRef={sectionRef}
                refKey={refKey}
                editable={editable}
                {...(disable_add !== undefined && { disable_add })}
            />
        </List>
    );
};

export default React.memo(DrawerFieldsBodyComponent);
