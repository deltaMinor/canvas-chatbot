import { UserStoryStringEnum } from "#root/enums/diagram";
import { SelectableValue } from "#root/interfaces";
import { StoryStringMapping } from "#root/interfaces/questionnaire_card";

export const getValueString = (key: UserStoryStringEnum, stringMapping: StoryStringMapping) => {
    const defaultValue = stringMapping?.[key]?.defaultValue || "";
    let value = stringMapping?.[key]?.rawValue || "";
    if (key === UserStoryStringEnum.interface) {
        // TODO: Remove after patching the data
        if (!Array.isArray(value) && typeof value === "object") {
            value = [value as SelectableValue];
        }
    }
    if (!!Array.isArray(value)) {
        value = value as SelectableValue[];
        const stringList = value?.map((value) => value?.label || "") || [];
        return stringList.length ? `${stringList.join(", ")}` : defaultValue;
    }
    if (!Array.isArray(value) && typeof value === "object") {
        value = value as SelectableValue;
        return `${value?.label || defaultValue}`;
    }
    return `${value || defaultValue}`;
};
