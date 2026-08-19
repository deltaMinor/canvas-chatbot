import { ExtendedFieldConfig, Question } from "#root/interfaces/questionnaire";

export interface FormValueMap {
    [key: string]: unknown;
}

export interface FormFieldConfig {
    multiple?: boolean;
    name: string;
}

export interface FormFieldInputProps<TValue = unknown> {
    name: string;
    onBlur: () => void;
    onChange: (value: unknown) => void;
    value: TValue;
}

export interface FormFieldHelperProps<TValue = unknown> {
    setValue: (value: TValue) => Promise<void>;
    setInitialValue: (value: TValue) => Promise<void>;
}

export interface TableFieldEffectsProps {
    fieldConfig: FormFieldConfig;
    formValues: FormValueMap;
    isFieldDisabled: boolean;
    isFieldTracked: boolean;
    question: Question;
    tableType: string;
    extendedFieldConfig?: ExtendedFieldConfig;
    immutableFieldIdList?: string[];
    unique_row_index?: number;
    uniqueFieldIdList?: string[];
}

export interface FormFieldRefContexts {}

export interface FormFieldRefObject {
    [key: string]: FormFieldRefContexts;
}

export interface CqFieldConfig extends FormFieldConfig {
    formFieldRef: React.RefObject<FormFieldRefObject>;
    formFieldRefKey: string;
}
