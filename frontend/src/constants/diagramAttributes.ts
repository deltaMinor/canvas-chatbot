import { MarkerType } from "@xyflow/react";

import { SelectableValue } from "#root/interfaces";
import { BaseFieldAttribute, DiagramIconPosition } from "#root/interfaces/diagramAttributes";
import { NodeIconKey, NodeIconName } from "#root/interfaces/svg";
import { convertCamelToTitleCase } from "#root/utils/genericHelper";

import { cacti_attribute_keys } from "./cacti";

export const nodeDataAttributesVisibleFields = [
    "label",
    "icon",
    "allowed_child_nodes",
    "publiclyAccessible",
    "data_stored",
    "icon_posiiton",
    "hostedInGCC",
    "runs_vendor_software",
    "network_functions_5g",
    "physicalLocation",
    "ip_address",
    "tosca_schema",
    "tosca_type",
];

export const defaultPhysicalLocationOptions: SelectableValue<string>[] = [
    { label: "Internet", value: "internet" },
    { label: "Not specified", value: "not_specified" },
];

export const defaultPhysicalLocationValues = defaultPhysicalLocationOptions?.map(
    (option) => option?.value || ""
);

export const icon_options =
    Object.keys(NodeIconKey)
        ?.sort()
        ?.map((key) => {
            return {
                label: NodeIconName?.[key as keyof typeof NodeIconName],
                value: key,
            };
        }) || [];

export const icon_position_options =
    Object.keys(DiagramIconPosition).map((key) => {
        return {
            label: key, //
            value: key,
        };
    }) || [];

export const main_attributes_common: BaseFieldAttribute[] = [
    {
        key: "id",
        deletable: false,
        disabled: true,
        label: "ID",
        type: "text",
    },
    {
        key: "className",
        deletable: false,
        disabled: true,
        label: "ClassName",
        type: "text",
    },
    {
        key: "label",
        deletable: false,
        disabled: true,
        label: "Label",
        type: "text",
    },
    {
        key: "type",
        deletable: false,
        disabled: true,
        label: "Type",
        type: "text",
    },
    {
        key: "zIndex",
        deletable: false,
        disabled: true,
        label: "Z Index",
        type: "number",
    },
    {
        key: "deletable",
        deletable: false,
        disabled: true,
        label: "Deletable",
        type: "checkbox",
    },
    {
        key: "hidden",
        deletable: false,
        disabled: true,
        label: "Hidden",
        type: "checkbox",
    },
];

export const data_attributes_common: BaseFieldAttribute[] = [
    {
        key: "label",
        deletable: false,
        disabled: false, // Disable if it is a user story drawer node
        label: "Label",
        type: "text",
    },
];

export const default_node_data_attributes: BaseFieldAttribute[] = [
    ...data_attributes_common,
    {
        key: "icon",
        deletable: false,
        disabled: true,
        label: "Icon",
        type: "selectIcon",
        options: icon_options,
    },
    {
        key: "allowed_child_nodes",
        deletable: false,
        disabled: true,
        label: "Allowed Child Nodes",
        type: "selectmultiple",
        options: icon_options,
    },
    {
        key: "publiclyAccessible",
        deletable: false,
        disabled: false,
        label: "Publicly Accessible",
        type: "checkbox",
    },
    {
        key: "data_stored",
        deletable: false,
        disabled: false,
        label: "Data Stored",
        type: "selectmultiple",
        options: [],
    },
    {
        key: "icon_position",
        deletable: false,
        disabled: false,
        label: "Icon Position",
        type: "select",
        options: icon_position_options,
    },
    {
        key: "hostedInGCC",
        deletable: false,
        disabled: false,
        label: "Hosted in GCC",
        type: "checkbox",
    },
    {
        key: "runs_vendor_software",
        deletable: false,
        disabled: false,
        label: "Does this node run 3rd party or vendor software?",
        type: "checkbox",
    },
    {
        key: "network_functions_5g",
        deletable: false,
        disabled: false,
        label: "5G Network Functions Supported",
        type: "selectmultiple",
        options: [
            {
                label: "Access and Mobility Management Function (AMF)",
                value: "access_mobility_management_function",
            },
            { label: "Session Management Function (SMF)", value: "session_management_function" },
            { label: "User Plane Function (UPF)", value: "user_plane_function" },
            {
                label: "Authentication Server Function (AUSF)",
                value: "authentication_server_function",
            },
            { label: "Unified Data Management (UDM)", value: "unified_data_management_function" },
            { label: "Policy Control Function (PCF)", value: "policy_control_function" },
            { label: "Network Repository Function (NRF)", value: "network_repository_function" },
            { label: "Network Exposure Function (NEF)", value: "network_exposure_function" },
            {
                label: "Network Slice Selection Function (NSSF)",
                value: "network_slice_selection_function",
            },
        ],
    },
    {
        key: "physicalLocation",
        deletable: false,
        disabled: false,
        label: "Physical Location",
        type: "select",
        options: [],
    },
    {
        key: "ip_address",
        deletable: false,
        disabled: false,
        label: "IP Address",
        type: "textIP",
    },
    {
        key: "device_firmware",
        deletable: true,
        disabled: false,
        label: "Device Firmware",
        type: "text",
    },
    {
        key: "device_os",
        deletable: true,
        disabled: false,
        label: "Device Operating System",
        type: "text",
    },
    {
        key: "vulnerabilities",
        deletable: true,
        disabled: false,
        label: "Vulnerabilities",
        type: "selectcreatable",
        options: [],
    },
];

export const default_data_advanced_attributes_common: BaseFieldAttribute[] = [
    {
        key: "type",
        deletable: false,
        disabled: true,
        label: "Type",
        options: [
            { label: "Architecture", value: "architecture" },
            { label: "Data Flow", value: "data_flow" },
        ],
        type: "select",
    },
    {
        key: "tosca_type",
        deletable: false,
        disabled: true,
        label: "Architecture Component Type",
        options: [],
        type: "text",
    },
    {
        key: "card_id",
        deletable: false,
        disabled: true,
        label: "Card ID",
        type: "text",
    },
    {
        key: "class",
        deletable: false,
        disabled: true,
        label: "Class", //
        type: "text",
    },
    {
        key: "consolidated_resource_nodes",
        deletable: false,
        disabled: true,
        label: "Consolidated Resource Nodes",
        type: "string_list",
    },
    {
        key: "consolidated_tosca_types",
        deletable: false,
        disabled: true,
        label: "Consolidated Tosca Types",
        type: "dict_list",
    },
    {
        key: "keyRisks",
        deletable: false,
        disabled: true,
        label: "Key Risks",
        options: [],
        type: "text",
    },
    {
        key: "tosca_schema",
        deletable: false,
        disabled: true,
        label: "Tosca Schema",
        options: [],
        type: "text",
    },
];

export const default_node_data_advanced_attributes: BaseFieldAttribute[] = [
    ...default_data_advanced_attributes_common,
    {
        key: "allowed_parent_nodes",
        deletable: false,
        disabled: true,
        label: "Allowed Parent Nodes",
        type: "selectmultiple",
        options: icon_options,
    },
    {
        key: "cardRefKey",
        deletable: false,
        disabled: true,
        label: "Card Reference Key",
        type: "text",
    },
];

export const default_edge_data_advanced_attributes: BaseFieldAttribute[] = [
    ...default_data_advanced_attributes_common, //
];

export const style_attributes_common: BaseFieldAttribute[] = [
    {
        key: "color",
        deletable: true,
        disabled: false,
        label: "Color",
        type: "color",
    },
    {
        key: "fill",
        deletable: true,
        disabled: false,
        label: "Fill",
        type: "color",
    },
    {
        key: "fillOpacity",
        deletable: true,
        disabled: false,
        label: "Fill Opacity",
        type: "number",
    },
    {
        key: "fontFamily",
        deletable: true,
        disabled: false,
        label: "Font Family",
        type: "text",
    },
    {
        key: "fontSize",
        deletable: true,
        disabled: false,
        label: "Font Size",
        type: "number",
    },
    {
        key: "fontWeight",
        deletable: true,
        disabled: false,
        label: "Font Weight",
        type: "number",
    },
    {
        key: "opacity",
        deletable: false,
        disabled: true,
        label: "Opacity",
        type: "number",
    },
    {
        key: "textAlign",
        deletable: true,
        disabled: false,
        label: "Text Align",
        type: "text",
    },
];

export const default_edge_style_attributes: BaseFieldAttribute[] = [
    ...style_attributes_common,
    {
        key: "stroke",
        deletable: false,
        disabled: false,
        label: "Stroke",
        type: "color",
    },
    {
        key: "strokeWidth",
        deletable: false,
        disabled: false,
        label: "Stroke Width",
        type: "number",
    },
];

export const default_node_style_attributes: BaseFieldAttribute[] = [
    ...style_attributes_common,
    {
        key: "height",
        deletable: false,
        disabled: false,
        label: "Height",
        type: "number",
    },
    {
        key: "width",
        deletable: false,
        disabled: false,
        label: "Width",
        type: "number",
    },
    {
        key: "backgroundColor",
        deletable: true,
        disabled: false,
        label: "Background Color",
        type: "color",
    },
    {
        key: "borderColor",
        deletable: true,
        disabled: false,
        label: "Border Color",
        type: "color",
    },
    {
        key: "borderRadius",
        deletable: true,
        disabled: false,
        label: "Border Radius",
        type: "text",
    },
    {
        key: "borderStyle",
        deletable: true,
        disabled: false,
        label: "Border Style",
        type: "text",
    },
    {
        key: "borderWidth",
        deletable: true,
        disabled: false,
        label: "Border Width",
        type: "text",
    },
];

// ##################################################

export const edge_main_attributes_unique: BaseFieldAttribute[] = [
    {
        key: "interactionWidth",
        deletable: false,
        disabled: true,
        label: "Interaction Width",
        type: "number",
    },
    {
        key: "source",
        deletable: false,
        disabled: true,
        label: "Source",
        type: "text",
    },
    {
        key: "sourceHandle",
        deletable: false,
        disabled: true,
        label: "Source Handle",
        type: "text",
    },
    {
        key: "target",
        deletable: false,
        disabled: true,
        label: "Target",
        type: "text",
    },
    {
        key: "targetHandle",
        deletable: false,
        disabled: true,
        label: "Target Handle",
        type: "text",
    },
    {
        key: "animated",
        deletable: false,
        disabled: true,
        label: "Animated",
        type: "checkbox",
    },
];

export const default_edge_main_attributes: BaseFieldAttribute[] = [
    ...main_attributes_common, //
    ...edge_main_attributes_unique,
];

export const default_edge_data_attributes: BaseFieldAttribute[] = [
    ...data_attributes_common,
    {
        key: "bidirectional",
        label: "Bidirectional",
        deletable: true,
        disabled: false,
        type: "checkbox",
    },
];

// ##################################################

export const node_main_attributes_unique: BaseFieldAttribute[] = [
    {
        key: "ariaLabel",
        deletable: false,
        disabled: true,
        label: "Aria Label",
        type: "text",
    },
    {
        key: "dragHandle",
        deletable: false,
        disabled: true,
        label: "Drag Handle",
        type: "text",
    },
    {
        key: "parentId",
        deletable: false,
        disabled: true,
        label: "Parent Node ID",
        type: "text",
    },
    {
        key: "position",
        deletable: false,
        disabled: true,
        label: "Position",
        type: "multiText",
    },
    {
        key: "positionAbsolute",
        deletable: false,
        disabled: true,
        label: "Position Absolute",
        type: "multiText",
    },
    {
        key: "sourcePosition",
        deletable: false,
        disabled: true,
        label: "Source Position",
        type: "select",
    },
    {
        key: "targetPosition",
        deletable: false,
        disabled: true,
        label: "Target Position",
        type: "select",
    },
    {
        key: "connectable",
        deletable: false,
        disabled: true,
        label: "Connectable",
        type: "checkbox",
    },
    {
        key: "draggable",
        deletable: false,
        disabled: true,
        label: "Draggable",
        type: "checkbox",
    },
    {
        key: "expandParent",
        deletable: false,
        disabled: true,
        label: "Expand Parent",
        type: "checkbox",
    },
    {
        key: "selectable",
        deletable: false,
        disabled: true,
        label: "Selectable",
        type: "checkbox",
    },
];

export const default_node_main_attributes: BaseFieldAttribute[] = [
    ...main_attributes_common, //
    ...node_main_attributes_unique,
];

export const edge_marker_attributes_common: BaseFieldAttribute[] = [
    {
        key: "color",
        deletable: true,
        disabled: false,
        label: "Color",
        type: "color",
    },
    {
        key: "type",
        deletable: false,
        disabled: false,
        label: "Type",
        options: Object.keys(MarkerType)?.map((key) => {
            return {
                label: key,
                value: MarkerType?.[key as keyof typeof MarkerType],
            };
        }),
        type: "select",
    },
    {
        key: "width",
        deletable: true,
        disabled: false,
        label: "Width",
        type: "number",
    },
    {
        key: "height",
        deletable: true,
        disabled: false,
        label: "Height",
        type: "number",
    },
    {
        key: "markerUnits",
        deletable: false,
        disabled: false,
        label: "Marker Units",
        type: "text",
    },
    {
        key: "orient",
        deletable: false,
        disabled: false,
        label: "Orient",
        type: "text",
    },
    {
        key: "strokeWidth",
        deletable: false,
        disabled: false,
        label: "Stroke Width",
        type: "number",
    },
];

export const default_edge_marker_attributes: BaseFieldAttribute[] = [
    ...edge_marker_attributes_common, //
];

export const node_data_cacti_attribute_reserved_keys: string[] = [...cacti_attribute_keys];

export const default_node_cacti_attributes: BaseFieldAttribute[] = cacti_attribute_keys.map(
    (key) => ({
        key,
        label: convertCamelToTitleCase(key),
        deletable: !node_data_cacti_attribute_reserved_keys?.includes(key),
        disabled: !!node_data_cacti_attribute_reserved_keys?.includes(key),
        type: "text",
    })
);

export const edge_data_cacti_attribute_reserved_keys: string[] = [...cacti_attribute_keys];

export const default_edge_cacti_attributes: BaseFieldAttribute[] = cacti_attribute_keys.map(
    (key) => ({
        key,
        deletable: !edge_data_cacti_attribute_reserved_keys?.includes(key),
        disabled: !!edge_data_cacti_attribute_reserved_keys?.includes(key),
        label: convertCamelToTitleCase(key),
        type: "text",
    })
);
