import React from "react";

import {
    CustomFieldGroup,
    DiagramElementAttrBaseFieldKey,
    DiagramElementType,
} from "#root/interfaces/diagramAttributes";

import AttributeDrawerAccordion from "./AttributeDrawerAccordion";
import AttributeDrawerFields from "./AttributeDrawerFields";

export interface AttributeDrawerTabContentProps {
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

const AttributeDrawerTabContentComponent = ({
    groups,
    editable,
    handleAddAttribute,
    handleRemoveLocal,
    handleRenewAttribute,
}: AttributeDrawerTabContentProps) => {
    if (!groups || groups.length === 0) return null;

    return (
        <>
            {groups.map((group, groupIndex) => {
                return (
                    <AttributeDrawerAccordion
                        key={groupIndex}
                        title={group.title}
                        defaultExpanded={group.default_expanded ?? false}
                    >
                        {group.fields.map((field, fieldIndex) => (
                            <AttributeDrawerFields
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
                    </AttributeDrawerAccordion>
                );
            })}
        </>
    );
};

export default React.memo(
    AttributeDrawerTabContentComponent
) as typeof AttributeDrawerTabContentComponent;
