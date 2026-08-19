import React from "react";

import { Stack, Typography } from "@mui/material";

import { StyledDataBox } from "./styled";

interface DialogConfirmDataListProps {
    data: string[] | React.ReactNode[] | undefined;
}

const DialogConfirmDataList = ({ data }: DialogConfirmDataListProps) => {
    if (!data?.length) return null;

    return (
        <StyledDataBox className="h-full p-1">
            <Stack spacing={1}>
                {data.map((d, index) => {
                    return (
                        <Typography
                            key={`${index}`} //
                            style={{
                                fontSize: "14px",
                            }}
                        >
                            {d}
                        </Typography>
                    );
                })}
            </Stack>
        </StyledDataBox>
    );
};

export default React.memo(DialogConfirmDataList);
