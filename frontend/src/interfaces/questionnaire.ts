import { DatabaseProps, MetadataObject, SelectableValue, SelectableValueGroup } from ".";
import { ChipProps } from "@mui/material";
import { FieldConfig, FormikContextType, FormikValues } from "formik";

import { ProjectDescTemplateKey } from "#root/constants/questionnaire";

import { ProjectProps } from "./common";

export enum PreConditionType {
    appendRefToOptions = "appendRefToOptions",
    appendValueToList = "appendValueToList",
    checkIsDisabledFromUserInput = "checkIsDisabledFromUserInput",
    enforceUniqueValue = "enforceUniqueValue",
    getExtendedFieldsFromMultipleQuestions = "getExtendedFieldsFromMultipleQuestions",
    getExtendedFieldsFromOneAnswer = "getExtendedFieldsFromOneAnswer",
    getInitialValuesFromUserInput = "getInitialValuesFromUserInput",
    getOptionsFromUserInput = "getOptionsFromUserInput",
}

export enum QuestionFieldType {
    select = "select",
    selectMulti = "selectMulti",
    selectGroup = "selectGroup",
    selectGroupMulti = "selectGroupMulti",
    selectCreatableMulti = "selectCreatableMulti",
    selectCreatableSingle = "selectCreatableSingle",
    radio = "radio",
    checkbox = "checkbox",
    userTable = "userTable",
    dataTable = "dataTable",
    rbacTable = "rbacTable",
    abacTable = "abacTable",
    subsystemTable = "subsystemTable",
    text = "text",
    textarea = "textarea",
    textTemplate = "textTemplate",
    card = "card",
    processCard = "processCard",
    date = "date",
    singleRowTableField = "singleRowTableField",
    textSelectable = "textSelectable",
    prompt = "prompt",
    image = "image",
    uploadJson = "uploadJson",
}

export enum QuestionnaireEnum {
    dependentFields = "dependentFields",
    initialValues = "initialValues",
    idList = "idList",
    schema_ = "schema_",
    sections = "sections",
    stage = "stage",
}

export enum QuestionnaireTableType {
    abac = "abac",
    rbac = "rbac",
    others = "others", // user, data, subsystem table
}

export interface dataType {
    role: string;
    numOfHigh: number;
    numOfNormal: number;
    numOfNon: number;
}

export interface DependentField {
    fieldIdRef: string;
    optionIds: string[];
}

export interface DependentFields {
    [key: string]: DependentField;
}

export interface QuestionExample {
    type: string;
    value: string;
    domains: string[];
}
export interface QuestionExplanation {
    type: string;
    value: string;
    domains: string[];
}

export interface UsefulnessProps {
    riskIds: string[];
    domains: string[];
    value: string;
}

export interface ExtendedFieldConfig {
    disableAddRow?: boolean;
    disableAnimation?: boolean;
    disableAddRowFromTemplate?: boolean;
    disableDeleteAction?: boolean;
    disableDuplicateAction?: boolean;
    disableEditTable?: boolean;
}

export interface FieldProps extends Omit<FieldConfig, "value">, Question {}

export interface FormQuestion {
    id: string;
    name: string;
    options?: string[];
    type: string;
}

export interface FormStates {
    currentStep: number;
    localContext: FormikContext;
}

export interface MatrixInput {
    row: string;
    columns: {
        label: string;
        value: number;
    }[];
}

export interface Preceding {
    answer: string;
    qid: string;
}

export interface PreCondition<T = SelectableValue, U = SelectableValueGroup> {
    description: string;
    properties: PreConditionProperties<T, U>;
    type: string;
}

export interface PreConditionProperties<T = SelectableValue, U = SelectableValueGroup> {
    fieldIdRef: string;
    extendedField?: Question<T, U>;
    extendedFieldIdRef?: string;
    fieldIdRefList?: string[];
    optionIds?: string[];
    [key: string]: unknown;
}

export interface PreConditionTarget {
    key: string;
    method: string;
}

export interface UploadedFileValue {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    content?: string;
    file_id?: string;
    uploadedAt?: string;
}

export type FormBaseValue =
    | string[]
    | string
    | SelectableValue
    | SelectableValue[]
    | UploadedFileValue
    | UploadedFileValue[];

export type FormValue = FormBaseValue | { [key: string]: FormBaseValue }[];

export type CardContentItemType = "string" | "string_list" | "chips";

export interface CardContentItem {
    title: string;
    value: string | string[];
    type: CardContentItemType;
    ignore_title?: boolean;
    chipColor?: ChipProps["color"];
    chipVariant?: ChipProps["variant"];
}

export interface Question<T = SelectableValue, U = SelectableValueGroup> {
    extendedFields?: Question<T, U>[];
    field: QuestionField<T, U>;
    fieldId: string;
    domains?: string[];
    header?: string;
    label: string;
    preConditions: PreCondition<T, U>[];
    properties: QuestionProperties;
    template?: unknown[];
    value?: unknown;
}

export interface QuestionField<T = SelectableValue, U = SelectableValueGroup> {
    accept?: string | string[];
    disabled: boolean;
    initialValue: FormValue;
    maxFileSizeBytes?: number;
    maxFiles?: number;
    options: T[];
    optionsGroup?: U[];
    placeholder: string;
    required: boolean;
    type: QuestionFieldType;
    template?: LLMPromptTemplate[][];
}

export interface QuestionInput {
    inputId: string;
    properties: QuestionInputProps;
}

export interface QuestionInputProps {
    [key: string]: string[] | string | undefined;
    option?: string;
}

export interface QuestionnaireData {
    schema_: string;
    values: { [key: string]: FormValue };
    metadata: MetadataObject;
}

export interface QuestionOption {
    optionId: string;
    canonicalName?: string;
    domains: string[];
    label: string;
    helperText?: string;
    tags?: string[];
    disabled?: boolean;
    ref?: { [key: string]: unknown };
}

export interface QuestionOptionGroup {
    label: string;
    options: QuestionOption[];
}

export interface QuestionProperties {
    examples: QuestionExample[];
    explanations: QuestionExplanation[];
    helperText: string;
    displayGroup?: string;
    valuePolicy?: string;
    defaultOptionsGroupKey?: string;
    defaultOptionsKey?: string;
    configuration?: string;
    configurationPreCondition?: { questionIdRef: string; optionId: string }[];
    usefulness_abstract: string;
    usefulness: UsefulnessProps[];
}

export interface Section<T = SelectableValue, U = SelectableValueGroup> {
    sectionId: string;
    sectionName: string;
    questions: Question<T, U>[];
    subsections: Subsection<T, U>[];
    summary: SectionSummary;
}

export interface SectionSummary {
    footer: string;
}

export interface StepUserInput {
    stepId: string;
    stepName: string;
    userInputs: UserInput[]; // equivalent of questions
}

export interface Subsection<T = SelectableValue, U = SelectableValueGroup> {
    questions: Question<T, U>[];
    subsectionId: string;
    subsectionName: string;
}

export type CQFormQuestionValue = SelectableValue;
export type CQFormQuestion = Question<CQFormQuestionValue, SelectableValueGroup>;
export type CQFormSection = Section<CQFormQuestionValue, SelectableValueGroup>;
export type CQFormSubsection = Subsection<CQFormQuestionValue, SelectableValueGroup>;

export interface TableRowParams {
    row_id?: string;
    [key: string]: unknown;
}

export interface UserInput extends Partial<Question> {
    value: unknown;
}

export interface userType {
    role: string;
    Internal: number;
    External: number;
    Others: number;
}

export type FormikContext = FormikContextType<FormikValues>;

export interface HelperInfo {
    type: string;
    value: string;
}

export enum UserStoryStringEnum {
    user = "user",
    data = "data",
    feature = "feature",
    device = "device",
    interface = "interface",
    intent = "intent",
    outcome = "outcome",
}

export interface PromptGenerationCombineTemplate {
    template: string;
    toCombine: string[];
    operator: string;
}
export interface PromptGenerationFormat {
    phase: string;
    template: string[];
    templateLines?: string[];
    combineTemplate?: PromptGenerationCombineTemplate[];
    userEditable: string[];
}

export interface PromptGenerationRule {
    generationOption: string;
    fieldId: string;
    format: PromptGenerationFormat[];
}

export interface ConfigurationObject {
    questions: LLMQuestion[];
    dependentFields: DependentFields;
}

export interface ProjectAssessmentConfigSection
    extends Section<QuestionOption, SelectableValueGroup>, ConfigurationObject {}

export interface ProjectAssessmentConfigObject extends ProjectProps {
    sections: ProjectAssessmentConfigSection[];
    values: { [key: string]: unknown };
    /** True when the backend confirmed AWS Bedrock is reachable at retrieval time. */
    bedrock_available?: boolean;
}

export enum ProjectAssessmentConfigSectionId {
    mainEngine = "main_engine",
    ai = "ai",
    pentest = "pentest",
    graphReasoning = "graph_reasoning",
}

export type ProjectAssessmentConfigObjectType = ProjectAssessmentConfigSectionId;
export type LLMQuestion = Question<QuestionOption>;

export type LLMQuestionField = QuestionField<QuestionOption>;

export interface LLMPromptTemplate {
    key: string;
    line: string;
    userEditable: boolean;
    userInput: string;
    isHidden: boolean;
}

export interface PreConditionMapping {
    preConditionFieldId: string;
    preCondition: PreCondition;
}

export interface QuestionPreConditionMapping {
    [key: string]: {
        question: Question; //
        preConditionMappingList: PreConditionMapping[];
    };
}

export interface ProjectDescTemplateValues {
    [ProjectDescTemplateKey.purpose]: string;
    [ProjectDescTemplateKey.method]: string;
    [ProjectDescTemplateKey.goal]: string;
}

// =================================
// System Automated Process Card
// =================================
export enum SystemProcessStringEnum {
    title = "title",
    triggerType = "triggerType",
    dataIngested = "dataIngested",
    dataForwarded = "dataForwarded",
    toSubsystem = "toSubsystem",
    fromSubsystem = "fromSubsystem",
    method = "method",
    feature = "feature",
    outcome = "outcome",
}

export interface SystemProcessPartObject {
    step: string;
    step_label: string;
    text: string;
    dynamicText?: string;
    extended_fields: Question[];
}

export enum SystemProcessStep {
    title = "title",
    start = "start",
    process = "process",
    outcome = "outcome",
}

export enum SystemProcessPhrase {
    title = "title",
    triggerType = "triggerType",
    dataIngested = "dataIngested",
    dataForwarded = "dataForwarded",
    feature = "feature",
    method = "method",
    fromSubsystem = "fromSubsystem",
    toSubsystem = "toSubsystem",
    outcome = "outcome",
}

export interface DynamicFieldConditionObject {
    step: SystemProcessStep;
    targetFieldId: string;
    preConditionFieldId: string;
    selectedOption: SelectableValue;
}
