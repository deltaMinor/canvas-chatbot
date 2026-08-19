import React from "react";

import { Menu, MenuProps } from "@mui/material";

interface MuiMenuProps extends MenuProps {}

const MuiMenuComponent = ({
    slotProps, //
    ...props
}: MuiMenuProps) => {
    return (
        <Menu //
            slotProps={{
                paper: {
                    className: "py-1 px-0 min-w-[150px] rounded",
                },
                list: {
                    sx: {
                        "& .MuiButtonBase-root": {
                            borderRadius: 0,
                        },
                        "& .MuiButtonBase-root > span": {
                            borderRadius: 0,
                        },
                    },
                    className: "p-0",
                },
                ...slotProps,
            }}
            elevation={10}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            {...props}
        />
    );
};

export default React.memo(MuiMenuComponent);
