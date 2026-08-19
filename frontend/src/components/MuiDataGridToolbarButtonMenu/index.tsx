import React from "react";

import { useTheme } from "@mui/material";

import MuiButtonMenu, { type MuiButtonMenuProps } from "#root/components/MuiButtonMenu";

interface MuiDataGridToolbarButtonMenuProps extends MuiButtonMenuProps {}

const MuiDataGridToolbarButtonMenuComponent = ({
    buttonProps: props__buttonProps = {},
    ...props //
}: MuiDataGridToolbarButtonMenuProps) => {
    const theme = useTheme();

    const optionValueList = props?.options?.map((opt) => opt.value) || [];
    const {
        style: props__buttonProps__style = {}, //
        ..._props__buttonProps
    } = props__buttonProps;
    const buttonProps = {
        ..._props__buttonProps,
        size: "small" as const,
        color: "primary" as const,
        style: {
            whiteSpace: "nowrap",
            lineHeight: 1,
            color:
                optionValueList?.includes("all") && props?.selectedValue !== "all" //
                    ? `${theme.palette.warning.main}`
                    : `${theme.palette.primary.main}`,
            borderColor:
                optionValueList?.includes("all") && props?.selectedValue !== "all" //
                    ? `${theme.palette.warning.main}`
                    : `${theme.palette.primary.main}`,
            ...props__buttonProps__style,
        },
    };

    return (
        <div style={{ marginLeft: "12px" }}>
            <MuiButtonMenu
                buttonProps={buttonProps}
                {...props} //
            />
        </div>
    );
};

export default React.memo(MuiDataGridToolbarButtonMenuComponent);
