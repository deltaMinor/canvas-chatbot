import React from "react";

import { MenuProps, SelectProps } from "@mui/material";

import { SelectableValue } from "#root/interfaces";
import { colors } from "#root/theme/PureLightTheme";

import { StyledMenuItem, StyledSelect } from "./styled";

interface StyledMuiSelectFieldProps {
    menuProps?: Partial<MenuProps>;
    selectProps: Partial<SelectProps>;
    options: SelectableValue[];
    placeholder: string;
    id?: string;
}

const StyledMuiSelectFieldComponent = ({
    menuProps = {},
    options = [],
    placeholder,
    selectProps,
    id,
}: StyledMuiSelectFieldProps) => {
    const {
        sx: selectProps__sx,
        ..._selectProps //
    } = selectProps;

    return (
        <StyledSelect
            id={id ?? ""}
            sx={{
                ...selectProps__sx,
            }}
            MenuProps={{
                slotProps: {
                    paper: {
                        className: "rounded",
                        style: {
                            border: `1px solid ${colors.primary.lighter}`, //
                        },
                    },
                },
                MenuListProps: {
                    className: "py-1 px-0", //
                },
                ...menuProps,
            }}
            fullWidth
            {...(_selectProps as Record<string, unknown>)} //
        >
            <StyledMenuItem //
                value=""
                disabled
            >
                {placeholder}
            </StyledMenuItem>
            {options?.map((option, index) => (
                <StyledMenuItem //
                    key={index}
                    value={option?.value}
                >
                    {option?.label}
                </StyledMenuItem>
            ))}
        </StyledSelect>
    );
};
export default React.memo(StyledMuiSelectFieldComponent);
