import { UserStoryStringEnum } from "#root/enums/diagram";
import { SelectableValue } from "#root/interfaces";
import { StoryStringMapping } from "#root/interfaces/questionnaire_card";

export const getValueString = (
    key: UserStoryStringEnum,
    stringMapping: StoryStringMapping
): string => {
    const defaultValue = stringMapping?.[key]?.defaultValue || "";
    let value = stringMapping?.[key]?.rawValue || "";

    // Handle interface type - legacy data format support
    if (key === UserStoryStringEnum.interface) {
        if (!Array.isArray(value) && typeof value === "object") {
            value = [value as SelectableValue];
        }
    }

    // Handle array values
    if (Array.isArray(value)) {
        const valueArray = value as SelectableValue[];
        const stringList = valueArray?.map((v) => v?.label || "").filter(Boolean) || [];
        return stringList.length > 0 ? stringList.join(", ") : defaultValue;
    }

    // Handle object values
    if (!Array.isArray(value) && typeof value === "object" && value !== null) {
        const valueObj = value as SelectableValue;
        const label = valueObj?.label;
        return label ? String(label) : defaultValue;
    }

    // Handle string values
    return String(value || defaultValue);
};
