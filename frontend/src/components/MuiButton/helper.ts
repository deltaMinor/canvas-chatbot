import { ButtonProps } from "@mui/material";

const DEFAULT_SIZE = "medium";

export const getDefaultPaddingFromSize = (size: "medium" | "small" | "large") => {
    if (size === "small") return "6px 18px";
    if (size === "medium") return "9px 18px";
    if (size === "large") return "12px 18px";
    return "6px 18px";
};

export const getDefaultStyle = (buttonProps: Partial<ButtonProps>) => {
    const { size = DEFAULT_SIZE } = buttonProps;
    const padding = getDefaultPaddingFromSize(size);
    return {
        padding,
    };
};

export const getDefaultIconPaddingFromSize = (size: "medium" | "small" | "large") => {
    if (size === "small") return "6px 6px";
    if (size === "medium") return "9px 9px";
    if (size === "large") return "12px 12px";
    return "9px 9px";
};

export const getDefaultIconStyle = (buttonProps: Partial<ButtonProps>) => {
    const { size = DEFAULT_SIZE } = buttonProps;
    const padding = getDefaultIconPaddingFromSize(size);
    return {
        padding,
    };
};
