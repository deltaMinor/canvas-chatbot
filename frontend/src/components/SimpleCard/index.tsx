import React from "react";

import { SxProps, Theme } from "@mui/material";

import SimpleCardContent from "./SimpleCardContent";
import SimpleCardTitle from "./SimpleCardTitle";
import { StyledCard } from "./styled";

interface SimpleCardProps {
    title?: string;
    children?: React.ReactNode;
    id?: string;
    sx?: SxProps<Theme>;
}

const SimpleCardComponent = ({ title = "", children, id, sx }: SimpleCardProps) => {
    return (
        <StyledCard id={id || "SimpleCard"} sx={sx}>
            <SimpleCardTitle title={title} />
            <SimpleCardContent>{children}</SimpleCardContent>
        </StyledCard>
    );
};

export default React.memo(SimpleCardComponent);
