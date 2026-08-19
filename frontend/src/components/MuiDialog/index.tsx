import React from "react";

import {
    DialogActions,
    DialogActionsProps,
    DialogContent,
    DialogContentProps,
    DialogProps,
    DialogTitle,
    DialogTitleProps,
    Stack,
    Typography,
} from "@mui/material";

import { StyledDialog } from "./styled";

export interface MuiDialogProps extends DialogProps {}
export interface MuiDialogTitleProps extends DialogTitleProps {
    title: string;
}
export interface MuiDialogContentProps extends DialogContentProps {}
export interface MuiDialogActionsProps extends DialogActionsProps {}

const MuiDialogRootComponent = ({
    children,
    slotProps: props__slotProps = {},
    ...props
}: MuiDialogProps) => {
    return (
        <StyledDialog
            slotProps={{
                ...props__slotProps,
            }}
            {...props}
        >
            {children}
        </StyledDialog>
    );
};

const MuiDialogTitleComponent = ({ title, children, ...props }: MuiDialogTitleProps) => {
    return (
        <DialogTitle {...props}>
            <Stack
                className="w-full"
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
                spacing={1}
            >
                <Typography
                    variant="h3"
                    sx={{
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    {title}
                </Typography>
                {children}
            </Stack>
        </DialogTitle>
    );
};

const MuiDialogContentComponent = ({ children, ...props }: MuiDialogContentProps) => {
    return <DialogContent {...props}>{children}</DialogContent>;
};

const MuiDialogActionsComponent = ({ children, ...props }: MuiDialogActionsProps) => {
    return <DialogActions {...props}>{children}</DialogActions>;
};

const MuiDialogRoot = React.memo(MuiDialogRootComponent);
const MuiDialogTitleMemo = React.memo(MuiDialogTitleComponent);
const MuiDialogContentMemo = React.memo(MuiDialogContentComponent);
const MuiDialogActionsMemo = React.memo(MuiDialogActionsComponent);

const MuiDialogCompound = Object.assign(MuiDialogRoot, {
    Root: MuiDialogRoot,
    Title: MuiDialogTitleMemo,
    Content: MuiDialogContentMemo,
    Actions: MuiDialogActionsMemo,
});

export default MuiDialogCompound;
