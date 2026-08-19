import { Edge } from "@xyflow/react";

import { DEFAULT_ICON_NODE_HEIGHT, DEFAULT_ICON_NODE_WIDTH } from "#root/constants/diagram";
import { SelectableValue } from "#root/interfaces";
import {
    CanvasNodeVariantType,
    CardNode,
    DiagramNode,
    UserStoryCardRefEnum,
} from "#root/interfaces/diagram";
import { BaseFieldAttribute, DiagramElementAttributes } from "#root/interfaces/diagramAttributes";

export const generateValidation = (attr: BaseFieldAttribute, data: Record<string, unknown>) => {
    if (attr.key == "width") {
        return generateValidationForMinMax(
            attr.key,
            (data?.["minWidth"] as number) ?? DEFAULT_ICON_NODE_WIDTH,
            data?.["maxWidth"] as number
        );
    }
    if (attr.key == "height") {
        return generateValidationForMinMax(
            attr.key,
            (data?.["minHeight"] as number) ?? DEFAULT_ICON_NODE_HEIGHT,
            data?.["maxHeight"] as number
        );
    }

    // Determine the validation function based on the attribute type
    let validation: (v: unknown) => boolean;

    switch (attr.type) {
        case "text":
            validation = (v) => typeof v === "string";
            break;
        case "textIP":
            validation = (v) => {
                const typedV = v as string;
                if (typedV == "") return true;
                const ipv4Regex =
                    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
                return ipv4Regex.test(v as string);
            };
            break;
        case "number":
            validation = (v) => typeof v === "number";
            break;
        case "checkbox":
            validation = (v) => !!v;
            break;
        default:
            validation = () => true;
    }

    return validation;
};

export const generateValidationForMinMax = (
    key: string, //
    minValue: number,
    maxValue?: number
) => {
    let validation: (v: unknown) => boolean;

    switch (key) {
        case "width":
        case "height":
            {
                if (!!maxValue)
                    validation = (v) =>
                        typeof v === "number" &&
                        v >= minValue && //
                        v <= maxValue;
                else
                    validation = (v) =>
                        typeof v === "number" && //
                        v >= minValue;
            }
            break;
        default:
            validation = () => true;
    }

    return validation;
};

export const generateDiagramElementDetails = (
    data: Record<string, unknown>,
    default_attributes: BaseFieldAttribute[] = [],
    editable: boolean
    // groupDisabled: boolean = false
) => {
    // const filteredAttributes =
    //     default_attributes?.filter((attr) => {
    //         return !!Object.keys(data)?.includes(attr.key);
    //     }) || [];

    const attribute_list = default_attributes.map((attr) => {
        return {
            ...attr,
            label: attr?.label || attr.key,
            disabled: editable ? (attr?.disabled ?? false) : true,
            type: attr?.type || "",
            validation: generateValidation(attr, data),
            options: attr?.options || [],
            deletable: attr?.deletable ?? true,
        };
    });

    // attribute_list = getArrangedAttributes(attribute_list);

    // const attributes: BaseFieldAttribute[] = groupDisabled
    //     ? attribute_list?.reduce<DrawerFieldAttribute>(
    //           (acc, curr) => {
    //               const key = curr?.disabled ? "advanced" : "basic";
    //               acc[key]?.push(curr);
    //               return acc;
    //           },
    //           { advanced: [], basic: [] }
    //       )
    //     : { basic: attribute_list ?? [] };

    const attribute_order = default_attributes.map((k) => k.key);

    const attributes: BaseFieldAttribute[] = getArrangedAttributes(attribute_list, attribute_order);

    return attributes;
};

export const getAttributeOptions = (
    attr_key: string, //
    allNodes: DiagramNode[]
) => {
    switch (attr_key) {
        case "targetPosition":
        case "sourcePosition":
            return [
                { label: "left", value: "left" },
                { label: "top", value: "top" },
                { label: "right", value: "right" },
                { label: "bottom", value: "bottom" },
            ];
        case "parentId":
            return allNodes
                ?.filter((n) => n?.type === CanvasNodeVariantType.clusterNode)
                ?.map((n) => {
                    return { label: n?.id, value: n?.id };
                });
        default:
            return [];
    }
};

export const getArrangedAttributes = (
    attribute_list: BaseFieldAttribute[],
    attribute_order: string[]
) => {
    return [...attribute_list].sort(
        (a, b) => attribute_order.indexOf(a.key) - attribute_order.indexOf(b.key)
    );
};

export const generateDiagramMainElementDetails = <T extends Edge | DiagramNode>(
    data: T,
    default_attributes: BaseFieldAttribute[] = [],
    editable: boolean,
    allNodes: DiagramNode[]
) => {
    const filteredAttributes =
        default_attributes?.filter((attr) => {
            return !!Object.keys(data)?.includes(attr.key);
        }) || [];

    let attribute_list: BaseFieldAttribute[] = filteredAttributes.map((attr) => {
        const attribute = {
            ...attr,
            disabled: !editable || attr.disabled,
            validation: generateValidation(attr, data),
            options:
                attr.type === "select"
                    ? getAttributeOptions(
                          attr.key, //
                          allNodes
                      )
                    : [],
        };

        return attribute;
    });

    const attribute_order = attribute_list.map((k) => k.key);

    attribute_list = getArrangedAttributes(attribute_list, attribute_order);
    return attribute_list;
};

export const getDataStoredOptions = (card_nodes: CardNode[]) => {
    return card_nodes
        ?.filter((card_node) => card_node.ref_key === UserStoryCardRefEnum.card_data)
        ?.map((card_node) => {
            return {
                label: card_node.label,
                value: card_node.value,
            } as SelectableValue;
        });
};

export const getDefaultAttributeValue = (type?: string) => {
    switch (type) {
        case "select":
            return "";
        case "selectmultiple":
            return [];
        case "number":
            return 0;
        case "text":
            return "";
        default:
            return "";
    }
};

/**
 * Gets available attribute options for adding new attributes.
 * Filters attributes that are not already present in the existing data and are deletable.
 *
 * @param attributes - Array of BaseFieldAttribute objects to filter
 * @param existingData - Object containing existing data keys to exclude from options
 * @returns Array of SelectableValue objects with label and value set to the attribute key
 */
export const getAvailableAttributeOptions = (
    attributes: BaseFieldAttribute[],
    existingData: Record<string, unknown>
): SelectableValue<string>[] => {
    return (
        attributes
            ?.filter(
                ({ key, ...attr }) =>
                    !Object.keys(existingData || {})?.includes(key) && !!attr?.deletable
            )
            ?.map(({ key }) => {
                return { label: key, value: key };
            }) || []
    );
};

export const stripAttributeValidation = (
    attributes: BaseFieldAttribute[] = []
): BaseFieldAttribute[] => {
    return attributes.map(({ validation, ...attribute }) => {
        void validation;
        return attribute;
    });
};

export const stripDiagramElementAttributes = (
    attributes: DiagramElementAttributes | null
): DiagramElementAttributes | null => {
    if (!attributes) {
        return attributes;
    }

    return Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [
            key,
            stripAttributeValidation(value ?? []),
        ])
    ) as unknown as DiagramElementAttributes;
};

export const hydrateAttributeValidation = (
    attributes: BaseFieldAttribute[] = [],
    data: Record<string, unknown> = {}
): BaseFieldAttribute[] => {
    return attributes.map((attr) => {
        const validation = generateValidation(attr, data);
        return {
            ...attr,
            validation,
        };
    });
};

export const hydrateDiagramElementAttributes = (
    attributes: DiagramElementAttributes | null,
    dataByKey: Partial<Record<keyof DiagramElementAttributes, Record<string, unknown>>>
): DiagramElementAttributes | null => {
    if (!attributes) {
        return attributes;
    }

    return Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [
            key,
            hydrateAttributeValidation(value ?? [], dataByKey[key as keyof typeof dataByKey] ?? {}),
        ])
    ) as unknown as DiagramElementAttributes;
};

// const getSubnetOptions = (nodes: DiagramNode[]) => {
//     const subnet_options = nodes
//         ?.filter(
//             (node) =>
//                 node?.data?.icon === AWSClusterNodeIconKey.privateSubnet ||
//                 node?.data?.icon === AWSClusterNodeIconKey.publicSubnet
//         )
//         ?.map((node) => {
//             return {
//                 label: node?.id, //
//                 value: node?.id,
//             } as OptionLabel;
//         });
//     return subnet_options;
// };
