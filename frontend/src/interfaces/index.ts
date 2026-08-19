import { AxiosError, AxiosResponse } from "axios";

export interface KeyStringAny {
    [key: string]: unknown;
}

export interface KeyStringBoolean {
    [key: string]: boolean;
}

export interface KeyStringNumber {
    [key: string]: number;
}

export interface SelectableValue<T = React.ReactNode> {
    label: T;
    value: string;
    canonicalName?: string;
    tags?: string[];
    domains?: string[];
    disabled?: boolean;
    hidden?: boolean;
    ref?: { [key: string]: unknown };
    data?: SelectableValue[];
}

export interface SelectableValueGroup {
    label: string;
    options: SelectableValue[];
}

export type Metadata = {
    created_on: MetadataObject;
    modified_on: MetadataObject;
};

export type MetadataObject = {
    timestamp: Date;
    user_id: string;
    username: string;
    data?: string | GenericDict;
};

export interface OptionLabel {
    label: React.ReactNode;
    value: string | number;
    canonicalName?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    domains?: string[];
    tags?: string[];
    isFixed?: boolean;
    isDisabled?: boolean;
}

export interface DatabaseProps {
    metadata: Metadata;
}

export interface ColorMapping {
    key: string;
    label: string;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    colorLight?: string;
}

export interface IdNameMappingProps {
    name: string;
    id: string;
    props?: {
        chip_values?: string[];
        extended_values?: unknown[];
        bg_color_mapping?: {
            [key: string]: string; //
        };
        color_mapping?: {
            [key: string]: string; //
        };
        extended?: {
            title: string; //
            values: string[];
        };
    };
}

export interface IdNameMapping {
    [key: string]: IdNameMappingProps;
}

export interface DefaultContextProviderProps<T = unknown> {
    contextRef?: React.RefObject<T>;
}

export interface AuditLog {
    user_id: string;
    username: string;
    timestamp: string;
    action: string;
    fieldChanges: GenericDict;
    targetKey: string;
    logId: string;
}

export interface GenericDict {
    [key: string]: GenericDict | GenericDict[] | number | string | string[] | undefined;
}

export type ApiErrorResponse<T = unknown> = AxiosError<{
    status: string;
    code: number;
    data: T;
    message: string;
}>;

export type AxiosApiResponse<T = unknown> = AxiosResponse<{
    code: number;
    data: T;
    message: string;
}>;

export type GenericDictType<K extends PropertyKey, T> = {
    [P in K]: T;
};

export * from "./dialogConfirm";
export * from "./dialogField";
export * from "./muiDataGridActionItem";
export * from "./reactSelect";
export * from "./sideMenu";
export * from "./viewRegisterDialog";
