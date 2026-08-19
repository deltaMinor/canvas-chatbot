import { DEFAULT_COLOR, DisplayTableCellAvatarVariant } from "./constants";

export const getAvatarStyle = (
    key: string, //
    variant: string,
    colorMapping: { [key: string]: string }
) => {
    if (variant === DisplayTableCellAvatarVariant.default) {
        return {
            backgroundColor:
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || DEFAULT_COLOR,
        };
    }
    if (variant === DisplayTableCellAvatarVariant.outlined) {
        return {
            backgroundColor: `${
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || DEFAULT_COLOR
            }30`,
            color:
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || DEFAULT_COLOR,
            border: `1px solid ${
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || DEFAULT_COLOR
            }`,
        };
    }
    return {};
};
