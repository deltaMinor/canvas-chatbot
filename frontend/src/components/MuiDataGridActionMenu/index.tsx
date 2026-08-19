import React from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Stack } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";

import MuiButtonMenu from "#root/components/MuiButtonMenu";
import { useMuiDataGridTableInstanceId } from "#root/components/MuiDataGridTable/contexts/MuiDataGridTableInstanceContext";
import { SelectableValue } from "#root/interfaces";
import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";
import { setMuiDataGridSelectedRowId } from "#root/stores/muiDataGridStore";

import { ActionItemMenuProps } from "./interface";

const defaultButtonStyle = {
    padding: 9, //
};

const defaultButtonSx = {
    color: "#223354",
};

interface MuiDataGridActionMenuProps {
    params: GridRenderCellParams; //
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    actionItemMenuPropsArr: ActionItemMenuProps[];
    disableCloseMenuOnClick?: boolean;
    handleClickMenu?: (
        e: React.MouseEvent<HTMLButtonElement> //
    ) => Promise<void>;
}

const MuiDataGridActionMenuComponent = ({
    params,
    apiRef: _apiRef,
    actionItemMenuPropsArr, //
    disableCloseMenuOnClick,
    ...props
}: MuiDataGridActionMenuProps) => {
    const muiDataGridTableInstanceId = useMuiDataGridTableInstanceId();

    const options =
        actionItemMenuPropsArr?.map((prop) => {
            return {
                label: prop.label, //
                value: prop.value,
                disabled: !!prop?.disabled,
                hidden: !!prop?.hidden,
                startIcon: prop?.startIcon,
            };
        }) || ([] as SelectableValue[]);
    const buttonProps = {
        startIcon: <MoreVertIcon />, //
        endIcon: undefined,
        style: { ...defaultButtonStyle },
        sx: { ...defaultButtonSx },
    };
    const menuProps = {
        anchorOrigin: {
            vertical: "top" as const,
            horizontal: "left" as const,
        },
        transformOrigin: {
            vertical: "top" as const,
            horizontal: "right" as const,
        },
    };
    const menuItemProps = {
        selected: false,
    };

    const handleClickMenu = async (
        event: React.MouseEvent<HTMLButtonElement> //
    ) => {
        setMuiDataGridSelectedRowId(`${params.id}`, muiDataGridTableInstanceId);
        if (!!props.handleClickMenu) props.handleClickMenu(event);
    };

    const handleClickMenuItem = async (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>, //
        value: string
    ) => {
        const actionItem = actionItemMenuPropsArr?.find((prop) => {
            return prop.value === value;
        });
        if (!actionItem) return;
        if (!!actionItem.handleClickMenuItem) {
            actionItem.handleClickMenuItem(event);
        }
    };

    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <MuiButtonMenu //
                options={options}
                buttonProps={buttonProps}
                menuProps={menuProps}
                menuItemProps={menuItemProps}
                handleClickMenu={handleClickMenu}
                handleClickMenuItem={handleClickMenuItem}
                {...(disableCloseMenuOnClick !== undefined && { disableCloseMenuOnClick })}
            />
        </Stack>
    );
};

export default MuiDataGridActionMenuComponent;
