import React from "react";

import LaunchIcon from "@mui/icons-material/Launch";
import { GridActionsCellItem } from "@mui/x-data-grid";

import MuiChip from "#root/components/MuiChip";
import { DISABLED_COLOR, DefaultActionTooltipTitle } from "#root/constants/muiDataGridActionItem";
import { MuiDataGridActionItemVariant } from "#root/enums/ui";
import { ActionItemComponentProps } from "#root/interfaces/muiDataGridActionItem";

const ViewActionItemComponent = ({
    buttonTitle = "",
    disabled, //
    hideIfDisabled,
    tooltipTitle = DefaultActionTooltipTitle.view,
    // tooltipTitleAlt = DefaultActionTooltipTitle.viewAlt,
    variant = MuiDataGridActionItemVariant.icon,
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
    const backgroundColor = !isDisabled ? "#5569ff" : DISABLED_COLOR;

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
            {variant === MuiDataGridActionItemVariant.icon && (
                <GridActionsCellItem
                    icon={<LaunchIcon style={{ color }} />}
                    onClick={handleClickCellItem}
                    label={tooltipTitle}
                    disabled={!!isDisabled}
                />
            )}
            {variant === MuiDataGridActionItemVariant.text && (
                <GridActionsCellItem
                    icon={
                        <MuiChip
                            tooltipTitle={tooltipTitle}
                            tooltipProps={{}}
                            label={buttonTitle}
                            style={{
                                color: "#fff", //
                                backgroundColor,
                            }}
                        />
                    }
                    onClick={handleClickCellItem}
                    label={buttonTitle}
                    disabled={!!isDisabled}
                />
            )}
        </a>
    );
};

export default React.memo(ViewActionItemComponent);
