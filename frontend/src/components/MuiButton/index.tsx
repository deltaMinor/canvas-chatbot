import React from "react";

import { ButtonProps, TooltipProps, Typography } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

import { getDefaultIconStyle, getDefaultStyle } from "./helper";
import { StyledButton } from "./styled";

export interface MuiButtonProps extends ButtonProps {
    tooltipProps?: Partial<TooltipProps>;
    isHidden?: boolean;
}

const MuiButtonComponent: React.FC<MuiButtonProps> = ({
    tooltipProps = {}, //
    children,
    isHidden,
    ...buttonProps
}) => {
    const {
        style: buttonProps__style, //
        sx: buttonProps__sx, //
        className: buttonProps__className,
        ..._buttonProps
    } = buttonProps;
    const wrapperStyle = _buttonProps.fullWidth ? { width: "100%" } : undefined;

    if (!!isHidden) return <></>;

    if (!children) {
        const defaultIconStyle = getDefaultIconStyle(buttonProps);
        return (
            <MuiTooltip
                placement="top"
                title={tooltipProps.title}
                {...tooltipProps}
            >
                <div style={wrapperStyle}>
                    <StyledButton
                        style={{
                            ...defaultIconStyle, //
                            ...buttonProps__style,
                        }}
                        sx={{
                            "& .MuiButton-icon": {
                                margin: 0,
                            }, //
                            ...buttonProps__sx,
                        }}
                        disableElevation
                        className={`min-h-0 min-w-0 rounded font-medium ${buttonProps__className}`}
                        {..._buttonProps}
                    />
                </div>
            </MuiTooltip>
        );
    }

    const defaultStyle = getDefaultStyle(buttonProps);
    return (
        <MuiTooltip
            placement="top"
            title={tooltipProps.title}
            {...tooltipProps}
        >
            <div style={wrapperStyle}>
                <StyledButton
                    style={{
                        ...defaultStyle, //
                        ...buttonProps__style,
                    }} //
                    sx={{
                        ...buttonProps__sx, //
                    }}
                    className={`min-h-0 min-w-0 rounded font-medium ${buttonProps__className}`}
                    disableElevation
                    {..._buttonProps}
                >
                    <Typography variant="h6">{children}</Typography>
                </StyledButton>
            </div>
        </MuiTooltip>
    );
};

export default React.memo(MuiButtonComponent);
