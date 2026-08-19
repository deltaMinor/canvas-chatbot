import { DisplayChipVariant } from "./constants";

export const getChipStyle = ({
    key,
    variant = DisplayChipVariant.default,
    backgroundColorMapping,
    colorMapping,
    backgroundColorDefault,
    colorDefault,
    borderColorDefault,
}: {
    backgroundColorDefault: string;
    colorDefault: string;
    borderColorDefault: string;
    //
    backgroundColorMapping?: { [key: string]: string };
    colorMapping?: { [key: string]: string };
    key?: string; //
    variant?: string;
}) => {
    if (variant === DisplayChipVariant.default) {
        return {
            backgroundColor:
                backgroundColorMapping?.[
                    key as keyof typeof backgroundColorMapping //
                ] || backgroundColorDefault,
            color:
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || colorDefault,
        };
    }
    if (variant === DisplayChipVariant.outlined) {
        return {
            backgroundColor: `${
                backgroundColorMapping?.[
                    key as keyof typeof backgroundColorMapping //
                ] || backgroundColorDefault
            }30`,
            color:
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || colorDefault,
            border: `1px solid ${
                colorMapping?.[
                    key as keyof typeof colorMapping //
                ] || borderColorDefault
            }`,
        };
    }
    return {};
};
