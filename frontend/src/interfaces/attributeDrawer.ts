import type {
    DiagramElementAttrBaseFieldKey,
    DiagramElementType,
    HandleAddAttribute,
    HandleRemoveLocal,
    HandleRenewAttribute,
} from "#root/interfaces/diagramAttributes";

export interface AttributeDrawerFormBridge {
    hasChanges: () => boolean;
    requestClose: () => Promise<void>;
    submitForm: () => Promise<void>;
    closeWithoutSaving: () => Promise<void>;
}

export interface DrawerFieldsRefObject {
    drawerFieldsContext: { [key: string]: DrawerFieldsContextInterface };
}

export interface DrawerFieldsContextInterface {
    attributeSetType: DiagramElementType;
    disable_add: boolean;
    handleAddAttribute: HandleAddAttribute;
    handleRemoveLocal: HandleRemoveLocal;
    handleRenewAttribute: HandleRenewAttribute;
    property: DiagramElementAttrBaseFieldKey;
}

export interface DrawerFieldsContextProviderProps {
    children?: React.ReactNode;
    attributeSetType: DiagramElementType;
    contextRef: React.RefObject<DrawerFieldsRefObject>;
    disable_add: boolean;
    handleAddAttribute: HandleAddAttribute;
    handleRemoveLocal: HandleRemoveLocal;
    handleRenewAttribute: HandleRenewAttribute;
    property: DiagramElementAttrBaseFieldKey;
    refKey: string;
}
