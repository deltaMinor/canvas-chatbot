import { SelectableValue } from ".";

// export interface DiagramElementDetails {
//     disabled: boolean;
//     key: string;
//     label: string;
//     type: string;
//     //
//     options?: SelectableValue[]; // Only for type === "select"
//     validation?: (value: unknown) => boolean;
// }

export interface BaseFieldAttribute {
    disabled: boolean;
    key: string;
    label: string;
    type: string;
    //
    deletable?: boolean;
    options?: SelectableValue[];
    validation?: (v: unknown) => boolean;
}

export interface DrawerFieldAttribute {
    advanced?: BaseFieldAttribute[];
    // basic: BaseFieldAttribute[] | DiagramElementDetails[];
    basic: BaseFieldAttribute[];
}

export interface DiagramElementAttributes {
    main: BaseFieldAttribute[];
    main_advanced: BaseFieldAttribute[];
    data: BaseFieldAttribute[];
    data_advanced: BaseFieldAttribute[];
    style: BaseFieldAttribute[];
    style_advanced: BaseFieldAttribute[];
    //
    cacti?: BaseFieldAttribute[];
    markerStart?: BaseFieldAttribute[];
    markerEnd?: BaseFieldAttribute[];
}

export enum DiagramElementAttrBaseFieldKey {
    data = "data",
    style = "style",
    markerStart = "markerStart",
    markerEnd = "markerEnd",
    main = "main",
}

export type DiagramElementType = "data" | "style" | "markerStart" | "markerEnd" | "main" | "cacti";

export type HandleAddAttribute = (
    type: DiagramElementType //
) => Promise<void>;

export type HandleSetLocal = (
    property: DiagramElementAttrBaseFieldKey,
    data: { [key: string]: unknown }
) => Promise<void>;

export type HandleRemoveLocal = (
    property: DiagramElementAttrBaseFieldKey,
    key: string
) => Promise<void>;

export type HandleRenewAttribute = (
    property: DiagramElementAttrBaseFieldKey,
    key: string
) => Promise<void>;

export interface CustomFieldConfig {
    attributes: BaseFieldAttribute[];
    attributeSetType: DiagramElementType;
    property: DiagramElementAttrBaseFieldKey;
    refKey: string;
    refObject?: Record<string, unknown>;
    handleAddAttribute?: HandleAddAttribute;
    handleSetLocal?: HandleSetLocal;
    handleRemoveLocal?: HandleRemoveLocal;
    handleRenewAttribute?: HandleRenewAttribute;
    editable?: boolean;
    disable_add?: boolean;
}

export interface CustomFieldGroup {
    title: string;
    fields: CustomFieldConfig[];
    tab_value: string;
    default_expanded?: boolean;
}

export interface TabConfig {
    tab_label: string;
    tab_index: number;
    fieldGroups: CustomFieldGroup[];
    tab_value: string;
}

export enum DiagramIconPosition {
    "top-left" = "top-left",
    "top-center" = "top-center",
    "top-right" = "top-right",
    "center-left" = "center-left",
    "center" = "center",
    "center-right" = "center-right",
    "bottom-left" = "bottom-left",
    "bottom-center" = "bottom-center",
    "bottom-right" = "bottom-right",
}
