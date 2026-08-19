import { FormikValues } from "formik";

import { SelectableValue } from "#root/interfaces";
import { ShortUuidIdentifierKey } from "#root/interfaces/identifier";
import {
    PreCondition,
    PreConditionType,
    Question,
    Section,
    TableRowParams,
} from "#root/interfaces/questionnaire";
import { generateShortUUID } from "#root/utils/identifierUtil";

/**
 * Base factory class for questionnaire operations.
 * Provides utility methods for accessing form values using field references.
 */
export class GenericQuestionnaireFactory {
    formValues: FormikValues;

    /**
     * Creates an instance of GenericQuestionnaireFactory.
     *
     * @param formValues - The form values from Formik to query against.
     */
    constructor(formValues: FormikValues) {
        this.formValues = formValues;
    }

    /**
     * Retrieves a value from formValues using a dot-notation field reference.
     * Supports nested objects and arrays (e.g., "section.field" or "array[0].field").
     *
     * @param fieldIdRef - Dot-separated field reference path (e.g., "section.subsection.fieldId").
     * @returns The value at the specified path, or undefined if not found.
     */
    getValue(fieldIdRef: string) {
        const fieldIdRefComponents = fieldIdRef?.split(".");
        let valueOut;
        let valueIn = { ...this.formValues };
        fieldIdRefComponents?.forEach((id, index) => {
            if (Array.isArray(valueIn)) {
                valueIn = [...(valueIn?.map((v) => v?.[id]) || [])];
            } else if (typeof valueIn === "object") {
                valueIn = { ...valueIn }?.[id];
            } else {
                // do nothing
            }
            if (index === fieldIdRefComponents?.length - 1) {
                valueOut = valueIn;
            }
        });
        return valueOut;
    }

    /**
     * Retrieves multiple values from formValues using a list of field references.
     *
     * @param fieldIdRefList - Array of dot-separated field reference paths.
     * @returns Array of values corresponding to each field reference.
     */
    getValues(fieldIdRefList: string[]) {
        const valueOutList = [] as unknown[];
        fieldIdRefList.forEach((fieldIdRef) => {
            valueOutList.push(this.getValue(fieldIdRef));
        });
        return valueOutList;
    }
}

/**
 * Factory class for handling conception questionnaire-specific operations.
 * Extends GenericQuestionnaireFactory to add question-specific logic for
 * managing selectable values, validation, and dynamic row generation.
 */
export class ConceptionQuestionnaireFactory extends GenericQuestionnaireFactory {
    question: Question;
    override formValues: FormikValues;

    /**
     * Creates an instance of ConceptionQuestionnaireFactory.
     *
     * @param question - The question object containing field definitions and preconditions.
     * @param formValues - The form values from Formik to query against.
     */
    constructor(question: Question, formValues: FormikValues) {
        super(formValues);
        this.question = question;
        this.formValues = formValues;
    }

    /**
     * Appends a reference value to a selectable value based on the question's preconditions.
     * The reference is retrieved from form values using the fieldIdRef specified in the precondition.
     *
     * @param selectableValue - The selectable value to append the reference to.
     * @param fieldId - The field ID to match against when finding the reference value.
     * @returns The selectable value with the appended reference, or the original value if no precondition exists.
     */
    appendRefToSelectableValue(selectableValue: SelectableValue, fieldId: string) {
        let _selectableValue = { ...selectableValue } as SelectableValue;
        const preCondition = this.question?.preConditions?.find(
            (p) => p?.type === PreConditionType.appendRefToOptions
        );
        if (!preCondition) return _selectableValue;

        const fieldIdRef = preCondition?.properties?.fieldIdRef;
        const value = this.getValue(fieldIdRef);
        if (!Array.isArray(value)) return _selectableValue;

        const matchedValue = (value as SelectableValue[])?.find((v) => v?.value === fieldId) || {};
        _selectableValue = { ..._selectableValue, ref: matchedValue };

        return _selectableValue;
    }

    /**
     * Appends reference values to an array of selectable values based on the question's preconditions.
     * Each selectable value gets the same reference appended based on the fieldId match.
     *
     * @param selectableValues - Array of selectable values to append references to.
     * @param fieldId - The field ID to match against when finding the reference value.
     * @returns Array of selectable values with appended references, or the original array if no precondition exists.
     */
    appendRefToSelectableValues(selectableValues: SelectableValue[], fieldId: string) {
        const _selectableValues = [...selectableValues] as SelectableValue[];
        const preCondition = this.question?.preConditions?.find(
            (p) => p?.type === PreConditionType.appendRefToOptions
        );
        if (!preCondition) return _selectableValues;

        const fieldIdRef = preCondition?.properties?.fieldIdRef;
        const value = this.getValue(fieldIdRef);
        if (!Array.isArray(value)) return _selectableValues;

        const __selectableValues = [] as SelectableValue[];
        selectableValues?.forEach((selectableValue) => {
            const matchedValue =
                (value as SelectableValue[])?.find((v) => v?.value === fieldId) || {};
            const _selectableValue = { ...selectableValue, ref: matchedValue };
            __selectableValues.push(_selectableValue);
        });
        return __selectableValues;
    }

    /**
     * Checks if all input values are unique based on the question's precondition.
     * Compares values using the label property of the extendedFieldIdRef.
     *
     * @param inputValues - Array of form input values to check for uniqueness.
     * @returns True if all values are unique, false if duplicates are found.
     *          Returns true if no enforceUniqueValue precondition exists.
     */
    checkUniqueValue(inputValues: FormikValues[]) {
        const preCondition = this.question?.preConditions?.find(
            (p) => p?.type === PreConditionType.enforceUniqueValue
        );
        if (!preCondition) {
            return true;
        }
        const { extendedFieldIdRef = "" } = preCondition?.properties || {};
        const seenValues = new Set();

        for (const inputValue of inputValues) {
            if (!extendedFieldIdRef) continue;
            const extendedFieldInputVal = inputValue?.[extendedFieldIdRef];
            if (seenValues.has(extendedFieldInputVal?.label)) return false;
            seenValues.add(extendedFieldInputVal?.label);
        }
        return true;
    }

    /**
     * Retrieves options from user input and merges them with the default field options.
     * Uses the getOptionsFromUserInput precondition to determine the source field reference.
     *
     * @returns Combined array of default options and user input options.
     *          Returns only default options if no precondition exists or no user input is found.
     */
    getOptionsFromUserInput() {
        const { field, preConditions } = this.question;
        const defaultOptions = field?.options;

        const preCondition = preConditions?.find(
            (p) => p?.type === PreConditionType.getOptionsFromUserInput
        );
        if (!preCondition) return defaultOptions;

        const fieldIdRef = preCondition?.properties?.fieldIdRef;

        const _options: SelectableValue[] = this.getValue(fieldIdRef) ?? [];
        if (!_options?.length) return defaultOptions;
        return [...(defaultOptions || []), ..._options];
    }

    /**
     * Generates an initial table row from user input with a header value.
     * Populates extended fields with their initial values and sets the header field.
     *
     * @param header - The selectable value to use as the header for the row.
     * @param extendedFieldIdRef - The field ID reference for the header field.
     * @returns A table row object with all extended fields initialized and a generated row_id.
     */
    getInitialRowFromUserInput(header: SelectableValue, extendedFieldIdRef: string) {
        const extendedFields = this.question?.extendedFields;
        const row = {} as TableRowParams;
        extendedFields?.forEach((e) => {
            const fieldId = e?.fieldId;
            if (fieldId === extendedFieldIdRef) {
                row[fieldId] = header;
                return;
            }
            row[fieldId] = e?.field?.initialValue;
        });
        const _row = {
            ...row,
            row_id: generateShortUUID(ShortUuidIdentifierKey.tableRow),
        };
        return _row;
    }

    /**
     * Checks if headers have been modified by comparing current headers with reference headers.
     * Determines if headers were added, removed, or changed.
     *
     * @param headers - The current headers to check.
     * @param refHeaders - The reference headers to compare against.
     * @returns True if headers have been modified (added, removed, or changed), false otherwise.
     */
    checkIfHeadersModified(headers: SelectableValue[], refHeaders: SelectableValue[]) {
        let modifiedHeaders = false;
        let match_headers = [] as SelectableValue[];
        let match_count = 0;
        headers?.forEach((h) => {
            let match = false;
            refHeaders?.forEach((rh) => {
                if (match) return;
                if (rh?.value === h?.value && rh?.label === h?.label) {
                    match = true;
                    match_headers.push({ ...rh });
                    match_count++;
                    return;
                }
            });
            if (!match) {
                modifiedHeaders = true;
                match_headers = [h, ...match_headers];
                match_headers.push({ ...h });
            }
        });
        if (match_count < refHeaders?.length) {
            modifiedHeaders = true;
        }
        return modifiedHeaders;
    }

    /**
     * Generates initial table rows from user input based on a precondition.
     * Each value from the fieldIdRef represents a row header. If patchValues is true,
     * existing row values are preserved when creating new rows.
     *
     * @param fieldValue - Existing table row values to potentially merge with.
     * @param preCondition - The precondition containing fieldIdRef and extendedFieldIdRef.
     * @param patchValues - If true, preserves existing row values when matching headers are found. Defaults to true.
     * @returns Array of table row objects with headers from user input and extended fields initialized.
     *          Returns empty array if extendedFieldIdRef is not provided.
     */
    getInitialRowsFromUserInput(
        fieldValue: TableRowParams[],
        preCondition: PreCondition,
        patchValues = true
    ) {
        const {
            fieldIdRef, //
            extendedFieldIdRef,
        } = preCondition?.properties || {};

        if (!extendedFieldIdRef) return [];

        // Each values from fieldIdRef represents a row
        const row_identifiers: SelectableValue[] = this.getValue(fieldIdRef) ?? [];

        const _rows = (row_identifiers || []).map((r) => {
            const existing_row = (fieldValue || []).find(
                (er) => (er?.[extendedFieldIdRef] as SelectableValue)?.value === r?.value
            );
            const initialRow = {
                [extendedFieldIdRef]: r,
                row_id: existing_row?.row_id ?? generateShortUUID(ShortUuidIdentifierKey.tableRow),
                ...(this.question?.extendedFields || [])
                    .filter((ef) => ef?.fieldId !== extendedFieldIdRef)
                    .reduce(
                        (acc, ef) => {
                            const fieldId = ef?.fieldId;
                            if (!fieldId) return acc;
                            if (!!existing_row && !!patchValues) {
                                acc[fieldId] = existing_row?.[fieldId];
                                acc["row_id"] =
                                    existing_row?.row_id ??
                                    generateShortUUID(ShortUuidIdentifierKey.tableRow);
                                return acc;
                            }
                            acc[fieldId] = ef?.field?.initialValue;
                            acc["row_id"] = generateShortUUID(ShortUuidIdentifierKey.tableRow);
                            return acc;
                        },
                        {} as { [key: string]: unknown }
                    ),
            };
            return initialRow;
        });

        return _rows;
    }
}

/**
 * Factory class for building conception questionnaire structures with extended fields.
 * Extends GenericQuestionnaireFactory to handle dynamic field generation from questionnaire
 * definitions and user input, enabling recursive field resolution.
 */
export class ConceptionQuestionnaireBuilderFactory extends GenericQuestionnaireFactory {
    question: Question;
    override formValues: FormikValues;
    sections: Section[];

    /**
     * Creates an instance of ConceptionQuestionnaireBuilderFactory.
     *
     * @param question - The question object to build extended fields for.
     * @param formValues - The form values from Formik to query against.
     * @param sections - The sections array containing all questions in the questionnaire.
     */
    constructor(question: Question, formValues: FormikValues, sections: Section[]) {
        super(formValues);
        this.question = question;
        this.formValues = formValues;
        this.sections = sections;
    }

    /**
     * Retrieves all extended fields for the question and updates the internal question reference.
     * This is a fluent method that returns the factory instance for method chaining.
     *
     * @returns The factory instance for method chaining.
     */
    getAllExtendedFields() {
        const _question = this.getExtendedFields(this.question);
        this.question = _question;
        return this;
    }

    /**
     * Recursively retrieves and builds extended fields for a question.
     * Processes preconditions to get extended fields from questionnaire definitions
     * and user input, then recursively processes extended fields themselves.
     *
     * @param question - The question object to build extended fields for.
     * @returns The question object with all extended fields recursively resolved.
     */
    getExtendedFields(question: Question) {
        // pipeline starts
        let _question = { ...question } as Question;
        _question = { ...this.getExtendedFieldsFromQuestionnaire(_question) };
        _question = { ...this.getExtendedFieldsFromUserInput(_question) };
        // pipeline ends

        const extendedFields = [] as Question[];
        _question?.extendedFields?.forEach((extendedField) => {
            // pipeline starts
            let _extendedField = { ...extendedField };
            _extendedField = { ...this.getExtendedFields(_extendedField) };
            // pipeline ends

            extendedFields.push(_extendedField);
        });
        _question = { ..._question, extendedFields: extendedFields };
        return _question;
    }

    /**
     * Retrieves a question from the questionnaire structure using a dot-notation field reference.
     * Searches through sections, questions, and subsections to find the matching question.
     *
     * @param fieldIdRef - Dot-separated field reference path (e.g., "section.question.subquestion").
     * @returns The question object matching the field reference, or an empty object if not found.
     */
    getQuestionFromQuestionnaire(fieldIdRef: string) {
        const fieldIdRefComponents = fieldIdRef?.split(".");
        let _extendedField = {} as Question;
        // let question = {} as Question;
        this.sections?.forEach((section) => {
            if (Object.keys(_extendedField)?.length) return;
            let questions = section?.questions;
            fieldIdRefComponents?.forEach((id, index) => {
                if (Object.keys(_extendedField)?.length) return;
                questions?.forEach((q) => {
                    if (Object.keys(_extendedField)?.length) return;
                    if (q?.fieldId === id) {
                        questions = [...(q?.extendedFields || [])];
                        if (index === fieldIdRefComponents?.length - 1) {
                            _extendedField = { ...q };
                        }
                    }
                });
            });

            if (Object.keys(_extendedField)?.length) return;
            section?.subsections?.forEach((subsection) => {
                if (Object.keys(_extendedField)?.length) return;
                let questions = subsection?.questions;
                fieldIdRefComponents?.forEach((id, index) => {
                    if (Object.keys(_extendedField)?.length) return;
                    questions?.forEach((q) => {
                        if (Object.keys(_extendedField)?.length) return;
                        if (q?.fieldId === id) {
                            questions = [...(q?.extendedFields || [])];
                            if (index === fieldIdRefComponents?.length - 1) {
                                _extendedField = { ...q };
                            }
                        }
                    });
                });
            });
        });
        return _extendedField;
    }

    /**
     * Retrieves extended fields from other questions in the questionnaire.
     * Uses the getExtendedFieldsFromMultipleQuestions precondition to find
     * questions specified in the fieldIdRefList.
     *
     * @param question - The question object to add extended fields to.
     * @returns The question object with extended fields added from other questions,
     *          or the original question if no precondition exists.
     */
    getExtendedFieldsFromQuestionnaire(question: Question) {
        const preCondition = question?.preConditions?.find(
            (p) => p?.type === PreConditionType.getExtendedFieldsFromMultipleQuestions
        );
        if (!preCondition) return question;

        const extendedFields = [] as Question[];
        (preCondition?.properties?.fieldIdRefList || []).forEach((fieldIdRef: string) => {
            const _extendedField = this.getQuestionFromQuestionnaire(fieldIdRef);
            extendedFields.push(_extendedField);
        });

        return {
            ...question,
            extendedFields: [
                ...extendedFields, //
                ...(question?.extendedFields || []),
            ],
        };
    }

    /**
     * Generates extended fields dynamically from user input values.
     * Uses the getExtendedFieldsFromOneAnswer precondition to create fields
     * based on values selected by the user. Each value becomes a new field.
     *
     * @param question - The question object to add extended fields to.
     * @returns The question object with extended fields generated from user input,
     *          or the original question if no precondition exists or no extendedField template is provided.
     */
    getExtendedFieldsFromUserInput(question: Question): Question {
        const preCondition = question?.preConditions?.find(
            (p) => p?.type === PreConditionType.getExtendedFieldsFromOneAnswer
        );
        if (!preCondition) return question;

        const {
            fieldIdRef, //
            extendedField,
        } = preCondition?.properties || {};

        if (!extendedField) {
            return {
                ...question, //
                extendedFields: [
                    ...(question?.extendedFields || []), //
                ],
            };
        }

        const entityList: SelectableValue[] = this.getValue(fieldIdRef) ?? [];
        const extendedFields = (entityList || []).map((e) => {
            const _extendedField = {
                ...extendedField, //
                label: e?.label,
                header: e?.label,
                fieldId: e?.value,
                domains: [import.meta.env.VITE_CQ_DOMAIN],
            };
            return _extendedField;
        });
        return {
            ...question, //
            extendedFields: [
                ...(question?.extendedFields || []), //
                ...extendedFields,
            ],
        } as Question;
    }
}
