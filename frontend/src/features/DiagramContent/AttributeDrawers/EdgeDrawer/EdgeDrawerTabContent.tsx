import React from "react";

import AttributeDrawer from "#root/components/DiagramAttributeForm";
import { DiagramElementAttrBaseFieldKey } from "#root/enums/diagram";
import { CustomFieldGroup, DiagramElementType } from "#root/interfaces/diagramAttributes";

export interface EdgeDrawerTabContentProps {
    groups: CustomFieldGroup[];
    editable: boolean;
    handleAddAttribute: (
        type: DiagramElementType //
    ) => Promise<void>;
    handleRemoveLocal: (
        p: DiagramElementAttrBaseFieldKey, //
        key: string
    ) => Promise<void>;
    handleRenewAttribute: (
        p: DiagramElementAttrBaseFieldKey, //
        k: string
    ) => Promise<void>;
}

const EdgeDrawerTabContentComponent = ({
    groups,
    editable,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
}: EdgeDrawerTabContentProps) => {
    if (!groups || groups.length === 0) return null;

    return (
        <>
            {groups.map((group, groupIndex) => (
                <AttributeDrawer.Accordion
                    key={groupIndex}
                    title={group.title}
                    defaultExpanded={group.default_expanded ?? false}
                >
                    {group.fields.map((field, fieldIndex) => (
                        <AttributeDrawer.Fields
                            key={fieldIndex}
                            attributes={field.attributes}
                            attributeSetType={field.attributeSetType}
                            editable={field.editable ?? editable}
                            property={field.property}
                            refKey={field.refKey}
                            refObject={field.refObject ?? {}}
                            disable_add={field.disable_add ?? false}
                            handleAddAttribute={field.handleAddAttribute ?? handleAddAttribute}
                            handleRemoveLocal={field.handleRemoveLocal ?? handleRemoveLocal}
                            handleRenewAttribute={
                                field.handleRenewAttribute ?? handleRenewAttribute
                            }
                        />
                    ))}
                </AttributeDrawer.Accordion>
            ))}
        </>
    );
};

export default React.memo(EdgeDrawerTabContentComponent);
