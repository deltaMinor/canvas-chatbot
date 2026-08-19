import React from "react";

import { Typography } from "@mui/material";

import MuiDialog from "#root/components/MuiDialog";
import MuiDialogTitle from "#root/components/MuiDialogTitle";
import { LogDialogInstanceContextProvider } from "#root/contexts/LogDialogInstanceContext";
import { LogDialogProps } from "#root/interfaces/logDialog";

import LogDialogBodyContent from "./LogDialogContent";
import LogDialogEffects from "./LogDialogEffects";
import LogDialogTable from "./LogDialogTable";

const EXCLUDED_KEYS = [] as string[];

interface LogDialogComponentProps extends LogDialogProps {
    open: boolean;
    handleClose: () => Promise<void>;
    excludedKeys?: string[];
}

interface LogDialogRootProps extends Pick<LogDialogComponentProps, "excludedKeys" | "getLogs"> {
    children?: React.ReactNode;
    handleClose: () => Promise<void>;
    open: boolean;
}

interface LogDialogHeaderProps {
    subtitle?: string;
    title: string;
}

interface LogDialogBodyProps {
    children?: React.ReactNode;
}

const LogDialogRoot = ({
    children,
    excludedKeys = EXCLUDED_KEYS,
    getLogs,
    handleClose,
    open,
}: LogDialogRootProps) => {
    return (
        <MuiDialog
            open={open} //
            onClose={handleClose}
            maxWidth="xl"
            fullWidth
        >
            <LogDialogInstanceContextProvider //
                initialState={{ excludedKeys }}
            >
                <LogDialogEffects
                    getLogs={getLogs}
                    open={open}
                />
                <>{children}</>
            </LogDialogInstanceContextProvider>
        </MuiDialog>
    );
};

const LogDialogHeader = ({ subtitle, title }: LogDialogHeaderProps) => {
    return (
        <MuiDialogTitle //
            title={`${title || ""}`}
        >
            {!!subtitle && <Typography>{subtitle}</Typography>}
        </MuiDialogTitle>
    );
};

const LogDialogBody = ({ children }: LogDialogBodyProps) => {
    return (
        <LogDialogBodyContent>
            <LogDialogTable />
            {children}
        </LogDialogBodyContent>
    );
};

const LogDialog = {
    Body: React.memo(LogDialogBody),
    Header: React.memo(LogDialogHeader),
    Root: React.memo(LogDialogRoot),
};

export default LogDialog;
