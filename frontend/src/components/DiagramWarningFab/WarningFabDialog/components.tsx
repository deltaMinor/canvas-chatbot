import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { SortDirection, WarningFilterKey } from "#root/enums/diagram";

export const getToggleVisibilityIcon = (
    nextWarningFlterKey: string //
) => {
    if (nextWarningFlterKey === WarningFilterKey.show_all.toString()) {
        return <SelectAllIcon />;
    }
    if (nextWarningFlterKey === WarningFilterKey.show_default.toString()) {
        return <VisibilityOffIcon />;
    }
    if (nextWarningFlterKey === WarningFilterKey.show_hidden.toString()) {
        return <VisibilityIcon />;
    }
    return <></>;
};

export const getToggleSortDirectionIcon = (
    nextWarningSortDirection: string //
) => {
    if (nextWarningSortDirection === SortDirection.ascending.toString()) {
        return <KeyboardDoubleArrowUpIcon />;
    }
    if (nextWarningSortDirection === SortDirection.descending.toString()) {
        return <KeyboardDoubleArrowDownIcon />;
    }
    return <></>;
};
