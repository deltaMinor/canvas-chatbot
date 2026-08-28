import { OptionLabel, SelectableValue, SelectableValueGroup } from "#root/interfaces";
import { GroupLabel } from "#root/interfaces/reactSelect";

// Helper functions to convert between SelectableValue/SelectableValueGroup and OptionLabel/GroupLabel
export const convertSelectableValueToOptionLabel = (sv: SelectableValue): OptionLabel => {
    const fallbackValue =
        (sv as unknown as { optionId?: string }).optionId ??
        (sv as unknown as { id?: string }).id ??
        "";
    const result: OptionLabel = {
        label: typeof sv.label === "string" ? sv.label : String(sv.label || ""),
        value: sv.value ?? fallbackValue,
        domains: sv?.domains || [],
        tags: sv?.tags || [],
    };
    if (sv.disabled !== undefined) {
        result.isDisabled = sv.disabled;
    }
    return result;
};

export const convertOptionLabelToSelectableValue = (
    ol: OptionLabel | null
): SelectableValue | null => {
    if (!ol) return null;
    const result: SelectableValue = {
        label: ol.label,
        value: typeof ol.value === "string" ? ol.value : String(ol.value),
        domains: ol?.domains || [],
    };
    if (ol.isDisabled !== undefined) {
        result.disabled = ol.isDisabled;
    }
    return result;
};

export const convertSelectableValueGroupToGroupLabel = (svg: SelectableValueGroup): GroupLabel => {
    return {
        label: svg.label,
        options: svg.options.map(convertSelectableValueToOptionLabel),
    };
};
