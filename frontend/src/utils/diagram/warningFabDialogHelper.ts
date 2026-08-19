import { SortDirection, WarningFilterKey } from "#root/enums/diagram";

export const getToggleVisibilityTooltipTitle = (
    nextWarningFlterKey: string //
) => {
    if (nextWarningFlterKey === WarningFilterKey.show_all.toString()) {
        return "Show all warnings.";
    }
    if (nextWarningFlterKey === WarningFilterKey.show_default.toString()) {
        return "Show visible warnings only.";
    }
    if (nextWarningFlterKey === WarningFilterKey.show_hidden.toString()) {
        return "Show hidden warnings only.";
    }
    return undefined;
};

export const getToggleVisibilityText = (
    nextWarningFlterKey: string //
) => {
    if (nextWarningFlterKey === WarningFilterKey.show_all.toString()) {
        return "Show All";
    }
    if (nextWarningFlterKey === WarningFilterKey.show_default.toString()) {
        return "Show Visible Only";
    }
    if (nextWarningFlterKey === WarningFilterKey.show_hidden.toString()) {
        return "Show Hidden Only";
    }
    return undefined;
};

export const getToggleSortDirectionTooltipTitle = (
    nextWarningSortDirection: string //
) => {
    if (nextWarningSortDirection === SortDirection.descending.toString()) {
        return "Sort in descending order.";
    }
    if (nextWarningSortDirection === SortDirection.ascending) {
        return "Sort in ascending order.";
    }
    return undefined;
};
