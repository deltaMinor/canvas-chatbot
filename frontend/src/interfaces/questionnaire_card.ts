import { SelectableValue } from ".";

export interface CardEditingStatus {
    [key: string]: boolean;
}

export interface CardProps extends CardValues {
    // is_auto_generated?: boolean;
    card_id: string;
    // user_story_line?: string;
}

export interface CardValues {
    [key: string]: CardValueType;
}

export interface UpdateFieldProps {
    card_id: string;
    value: {
        label: string;
        value: CardValueType;
    };
}

export type CardValueType =
    | undefined
    | boolean
    | string
    | string[]
    | SelectableValue
    | SelectableValue[];

export interface StoryStringMappingSingle {
    defaultValue: string;
    rawValue?: CardValueType;
}

export interface StoryStringMapping {
    [key: string]: StoryStringMappingSingle;
}

export interface ProcessCardValues {
    [key: string]: CardValueType;
}

export interface ProcessItem extends ProcessCardValues {
    process_id: string;
}

export interface ProcessCardProps {
    card_id: string;
    is_editing: boolean;
    title: ProcessCardValues;
    start: ProcessCardValues;
    process: ProcessItem[];
    outcome: ProcessCardValues;
}
