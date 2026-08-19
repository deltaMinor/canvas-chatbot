import React from "react";

import { MenuProps, SelectProps } from "@mui/material";

import { SelectableValueGroup } from "#root/interfaces";
import { colors } from "#root/theme/PureLightTheme";

import { StyledListSubheader, StyledMenuItem, StyledSelect } from "./styled";

interface StyledMuiSelectFieldGroupProps {
    menuProps?: Partial<MenuProps>;
    selectProps: Partial<SelectProps>;
    options: SelectableValueGroup[];
    placeholder: string;
    id: string;
}

const StyledMuiSelectFieldGroupComponent = ({
    menuProps = {},
    options = [],
    placeholder,
    selectProps,
    id,
}: StyledMuiSelectFieldGroupProps) => {
    const {
        sx: selectProps__sx,
        ...restSelectProps //
    } = selectProps;

    const hasValue = restSelectProps.multiple
        ? Array.isArray(restSelectProps.value) && restSelectProps.value.length > 0
        : restSelectProps.value !== undefined &&
          restSelectProps.value !== "" &&
          restSelectProps.value !== null;

    return (
        <StyledSelect
            id={id}
            sx={{
                ...selectProps__sx,
            }}
            MenuProps={{
                slotProps: {
                    paper: {
                        sx: {
                            borderRadius: "8px",
                            border: `1px solid ${colors.primary.lighter}`,
                            boxShadow: colors.shadows.card,
                            marginTop: "8px",
                            maxHeight: "400px",
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: colors.alpha.black[5],
                                borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: colors.alpha.black[20],
                                borderRadius: "4px",
                                "&:hover": {
                                    background: colors.alpha.black[30],
                                },
                            },
                        },
                    },
                },
                MenuListProps: {
                    sx: {
                        padding: "8px 0",
                    },
                },
                ...menuProps,
            }}
            fullWidth
            {...restSelectProps} //
        >
            {!hasValue && (
                <StyledMenuItem //
                    value=""
                    disabled
                >
                    {placeholder}
                </StyledMenuItem>
            )}
            {options?.flatMap((optionGroup, gIndex) => [
                <StyledListSubheader key={`optionGroup_${gIndex}`}>
                    {optionGroup.label}
                </StyledListSubheader>,
                ...optionGroup.options.map((optionItem, oIndex) => (
                    <StyledMenuItem
                        key={`option_${gIndex}_${oIndex}`}
                        value={optionItem?.value}
                    >
                        {optionItem?.label}
                    </StyledMenuItem>
                )),
            ])}
        </StyledSelect>
    );
};
export default React.memo(StyledMuiSelectFieldGroupComponent);
