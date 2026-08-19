import React from "react";

import VisibilityIcon from "@mui/icons-material/Visibility";
import { GridActionsCellItem } from "@mui/x-data-grid";

import { DISABLED_COLOR, DefaultActionTooltipTitle } from "#root/constants/muiDataGridActionItem";
import { ActionItemComponentProps } from "#root/interfaces/muiDataGridActionItem";

const UnhideActionItemComponent = ({
    disabled, //
    hideIfDisabled,
    tooltipTitle = DefaultActionTooltipTitle.hide,
    // tooltipTitleAlt = DefaultActionTooltipTitle.hideAlt,
    // variant = "",
    getUrl = () => undefined,
    handleClick = async () => {},
    shouldDisable = () => false,
    // shouldDisplayAlt = () => false,
    gridRowParams,
}: ActionItemComponentProps) => {
    // Ref
    const clicked = React.useRef<boolean>(false);

    const isDisabled = !!disabled || !!shouldDisable(gridRowParams);
    const color = !isDisabled ? "#5569ff" : DISABLED_COLOR;

    const handleClickCellItem = React.useCallback(async () => {
        if (!!clicked.current) return;
        try {
            clicked.current = true;
            await handleClick(gridRowParams);
        } finally {
            clicked.current = false;
        }
    }, [gridRowParams, handleClick]);

    if (!!isDisabled && !!hideIfDisabled) return <></>;

    return (
        <a href={getUrl(gridRowParams)}>
            <GridActionsCellItem //
                icon={<VisibilityIcon style={{ color }} />}
                onClick={handleClickCellItem}
                label={tooltipTitle}
                disabled={!!isDisabled}
            />
        </a>
    );
};

export default React.memo(UnhideActionItemComponent);
