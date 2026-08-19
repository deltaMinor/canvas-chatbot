import React from "react";

import { Stack } from "@mui/material";

import MuiButton from "#root/components/MuiButton";
import {
    useNextWarningFlterKey,
    useNextWarningSortDirection,
    useToggleSortDirection,
    useToggleWarningFilterKey,
} from "#root/hooks/diagram";
import {
    getToggleSortDirectionTooltipTitle,
    getToggleVisibilityTooltipTitle,
} from "#root/utils/diagram/warningFabDialogHelper";

import { getToggleSortDirectionIcon, getToggleVisibilityIcon } from "./components";

const WarningFabDialogToolbarComponent = () => {
    const nextWarningFlterKey = useNextWarningFlterKey();
    const nextWarningSortDirection = useNextWarningSortDirection();
    const toggleWarningFilterKey = useToggleWarningFilterKey();
    const toggleSortDirection = useToggleSortDirection();

    const handleClickToggleWarningFilter = React.useCallback(async () => {
        toggleWarningFilterKey();
    }, [toggleWarningFilterKey]);

    const handleClickToggleSortDirection = React.useCallback(async () => {
        toggleSortDirection();
    }, [toggleSortDirection]);

    return (
        <Stack
            direction="row" //
            spacing={1}
            sx={{
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Stack
                direction="row"
                spacing={1}
            >
                <MuiButton //
                    onClick={handleClickToggleWarningFilter}
                    tooltipProps={{
                        title: getToggleVisibilityTooltipTitle(nextWarningFlterKey), //
                    }}
                    startIcon={getToggleVisibilityIcon(nextWarningFlterKey)}
                    variant="contained"
                />
                <MuiButton //
                    onClick={handleClickToggleSortDirection}
                    tooltipProps={{
                        title: getToggleSortDirectionTooltipTitle(nextWarningSortDirection), //
                    }}
                    startIcon={getToggleSortDirectionIcon(nextWarningSortDirection)}
                    variant="contained"
                />
            </Stack>
            <Stack
                direction="row"
                spacing={1}
            >
                {/* <ReactSelect<OptionLabel, false> //
                    value={warningSortCriteriaOptions?.find((opt) => {
                        return opt.value === warningSortCriteria;
                    })}
                    options={warningSortCriteriaOptions}
                    handleChange={handleChangeWarningSortCriteria}
                    size="small"
                /> */}
            </Stack>
        </Stack>
    );
};

export default WarningFabDialogToolbarComponent;
