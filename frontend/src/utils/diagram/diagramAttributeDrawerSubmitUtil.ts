import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import { BaseFieldAttribute, TabConfig } from "#root/interfaces/diagramAttributes";

interface SubmitAttributeDrawerDraftParams<TDraft extends DiagramNode | DiagramEdge> {
    values: Record<string, unknown>;
    tabs: TabConfig[];
    draft: TDraft | null;
    saveDraft: (draftOverride?: TDraft) => Promise<void>;
    debugKey: string;
    debugData?: Record<string, unknown>;
}

const getSectionValues = (
    rawSectionValues: unknown,
    attributes: BaseFieldAttribute[]
): Record<string, unknown> | null => {
    if (!rawSectionValues || typeof rawSectionValues !== "object") {
        return null;
    }

    const sectionValues = attributes.reduce<Record<string, unknown>>(
        (acc: Record<string, unknown>, attribute: BaseFieldAttribute) => {
            if (Object.prototype.hasOwnProperty.call(rawSectionValues, attribute.key)) {
                acc[attribute.key] = (rawSectionValues as Record<string, unknown>)[attribute.key];
            }

            return acc;
        },
        {}
    );

    return Object.keys(sectionValues).length > 0 ? sectionValues : null;
};

const mergeSectionIntoDraft = <TDraft extends DiagramNode | DiagramEdge>(
    draft: TDraft,
    propertyKey: string,
    sectionValues: Record<string, unknown>
): TDraft => {
    if (propertyKey === "main") {
        return {
            ...draft,
            ...sectionValues,
        };
    }

    const currentSection = (draft[propertyKey as keyof TDraft] as Record<string, unknown>) ?? {};

    return {
        ...draft,
        [propertyKey]: {
            ...currentSection,
            ...sectionValues,
        },
    };
};

export const submitAttributeDrawerDraft = async <TDraft extends DiagramNode | DiagramEdge>({
    values,
    tabs,
    draft,
    saveDraft,
}: SubmitAttributeDrawerDraftParams<TDraft>) => {
    const processedProperties = new Set<string>();
    let nextDraft = draft;

    for (const tab of tabs) {
        for (const group of tab.fieldGroups) {
            for (const field of group.fields) {
                const propertyKey = field.property.toString();

                if (processedProperties.has(propertyKey)) continue;

                processedProperties.add(propertyKey);

                const sectionValues = getSectionValues(values[field.refKey], field.attributes);

                if (!sectionValues) continue;

                if (nextDraft) {
                    nextDraft = mergeSectionIntoDraft(nextDraft, propertyKey, sectionValues);
                }
            }
        }
    }

    await saveDraft(nextDraft ?? undefined);
};
