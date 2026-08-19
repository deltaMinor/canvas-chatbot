import React from "react";

import { Stack, Typography } from "@mui/material";

import MuiButton from "#root/components/MuiButton";

import { CustomMenuType } from "./interface";

interface CustomMenuHeadProps {
    customMenuList: CustomMenuType[];
    isLastStep: boolean;
}

const CustomMenuHead = ({
    customMenuList, //
}: CustomMenuHeadProps) => {
    return (
        <>
            <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="flex-start"
                spacing={2}
            >
                {!!customMenuList?.length &&
                    customMenuList.map((m) => {
                        return !m.disabled ? (
                            <MuiButton
                                key={m.text} //
                                variant="contained"
                                onClick={m.handleClickMenu}
                                size="small"
                            >
                                <Typography variant="button">{m.text}</Typography>
                            </MuiButton>
                        ) : null;
                    })}
            </Stack>
        </>
    );
};

export default React.memo(CustomMenuHead);
