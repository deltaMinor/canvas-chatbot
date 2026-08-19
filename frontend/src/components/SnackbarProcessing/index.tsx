import React from "react";

import { Stack, Typography } from "@mui/material";
import { CustomContentProps } from "notistack";

import { StyledSnackbarContent } from "./styled";

export interface SnackbarProcessingProps extends CustomContentProps {
    iconComponent?: React.ReactNode;
}

const SnackbarProcessingComponent = React.forwardRef<HTMLDivElement, SnackbarProcessingProps>(
    (props, ref) => {
        const {
            iconComponent,
            id,
            message,
            // ..._props
        } = props;
        const _props = Object.entries(props).reduce(
            (acc, [k, v]) => {
                if (
                    !![
                        "anchorOrigin",
                        "autoHideDuration",
                        "hideIconVariant",
                        "iconVariant",
                        "persist",
                        "iconComponent", // Add iconComponent to the exclusion list
                        //
                        "className",
                        "id",
                        "role",
                        "ref",
                    ]?.includes(k)
                )
                    return acc;
                if (!v) return acc;
                acc[k] = v;
                return acc;
            },
            {} as { [key: string]: unknown }
        );

        return (
            <StyledSnackbarContent
                ref={ref}
                role="alert"
                id={`${id}`}
                className="snackbar_content shadow-md"
                {..._props}
            >
                <Stack //
                    direction="row"
                    className="max-w-full items-center justify-start px-0 py-[4.5px]"
                >
                    {iconComponent && (
                        <span //
                            className="mr-1"
                        >
                            {iconComponent}
                        </span>
                    )}
                    <Typography //
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                        {message}
                    </Typography>
                </Stack>
            </StyledSnackbarContent>
        );
    }
);

SnackbarProcessingComponent.displayName = "SnackbarProcessingComponent";
export default React.memo(SnackbarProcessingComponent);
