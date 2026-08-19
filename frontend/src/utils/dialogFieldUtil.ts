import { DialogFieldTypeEnum } from "#root/enums/dialog";
import { OptionLabel } from "#root/interfaces";
import {
    DialogFieldPropFields,
    DialogFieldSubmitValues,
    DialogFieldValues,
} from "#root/interfaces/dialogField";

export const getOrderedValue = (value: OptionLabel[], options: OptionLabel[]) => {
    if (!value?.length) return [];

    const fixedValue: OptionLabel[] = [];
    const nonFixedValue: OptionLabel[] = [];
    value?.forEach((v) => {
        const option = options?.find((o) => o.value === v.value);
        if (!!option?.isFixed) {
            fixedValue.push(v);
            return;
        }
        nonFixedValue.push(v);
    });
    return [...fixedValue, ...nonFixedValue];
};

export const runDialogFieldValuesCheck = (
    fields: DialogFieldPropFields<DialogFieldValues<unknown> | DialogFieldValues<unknown>[]>[],
    values: { [key: string]: unknown }
) => {
    fields?.forEach((f) => {
        if (!f?.required) return;
        const val = values?.[f.id];
        const isArr = !!Array.isArray(val);
        if (
            (!isArr && !val) || //
            (!!isArr && !val?.length)
        ) {
            throw new Error("One or more required fields are undefined.");
        }
    });

    Object.entries(values)?.forEach(([key, val]) => {
        const field = fields?.find((f) => f.id === key);
        if (!field || !field?.requiredIfChanged) return;
        const isArr = !!Array.isArray(val);
        if (
            (!isArr && val === undefined) || //
            (!!isArr && !val?.length)
        ) {
            throw new Error("One or more modified fields are undefined.");
        }
    });

    Object.entries(values)?.forEach(([key, val]) => {
        const field = fields?.find((f) => f.id === key);
        const isArr = !!Array.isArray(val);
        if (
            !field || //
            !isArr ||
            !field?.removeEmptyRow ||
            !field?.row_key
        )
            return;
        const _val = val?.filter((v) => {
            if (typeof v !== "object") return true;
            if (!!v?.[field.row_key as keyof typeof v]) return true;
            return false;
        });
        values[key] = _val;
    });

    let equal_val = "";
    let value_mismatch = false;
    fields?.forEach((f) => {
        if (!!f?.check_equal && equal_val === "") {
            equal_val = values?.[f.id] as string;
            return;
        }
        if (!!f?.check_equal && values?.[f.id] !== equal_val) {
            value_mismatch = true;
        }
    });
    if (!!value_mismatch) throw new Error("Fields mismatch.");
};

const normalizeDialogFieldValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        if (!value.length) return "";
        return value.map((item) => normalizeDialogFieldValue(item));
    }
    if (!!value && typeof value === "object") {
        return Object.entries(value)
            .filter(([key]) => key !== "row_id")
            .sort(([a], [b]) => a.localeCompare(b))
            .reduce(
                (acc, [key, itemValue]) => {
                    acc[key] = normalizeDialogFieldValue(itemValue);
                    return acc;
                },
                {} as Record<string, unknown>
            );
    }
    return value ?? "";
};

export const checkIfDialogFieldDirty = (
    fields: DialogFieldPropFields<DialogFieldValues<unknown> | DialogFieldValues<unknown>[]>[],
    values: DialogFieldSubmitValues
) => {
    return fields?.some((field) => {
        if (field.type === DialogFieldTypeEnum.displayText) return false;
        if (field.type === DialogFieldTypeEnum.displayGroupRisks) return false;
        if (field.type === DialogFieldTypeEnum.displayLoginHistory) return false;
        const currentValue = values?.[field.id];
        const defaultValue = field.defaultValue;
        if (currentValue === undefined) return false;
        return (
            JSON.stringify(normalizeDialogFieldValue(currentValue)) !==
            JSON.stringify(normalizeDialogFieldValue(defaultValue))
        );
    });
};

export const getHiddenStates = (
    fields: DialogFieldPropFields[], //
    values: DialogFieldSubmitValues
) => {
    return fields?.reduce(
        (acc, f) => {
            if (!f?.shouldHideField) {
                acc[f.id] = false;
                return acc;
            }
            acc[f.id] = f.shouldHideField(values);
            return acc;
        },
        {} as Record<string, boolean>
    );
};
