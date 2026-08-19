import React from "react";

import { Alert, Box, DialogContent } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

import MuiDialog from "#root/components/MuiDialog";
import { useSelectedAuditLog } from "#root/hooks/logDialog";

import DialogHeader from "./DialogHeader";
import SummarySection from "./SummarySection";
import TechnicalDetailsSection from "./TechnicalDetailsSection";

interface LogDetailsDialogRootProps {
    children?: React.ReactNode;
    onClose: () => void;
    open: boolean;
}

interface LogDetailsDialogHeaderProps {
    title?: string;
}

const contentStyles: SxProps<Theme> = {
    py: 3,
    px: 0,
};

const LogDetailsDialogRoot = ({ children, onClose, open }: LogDetailsDialogRootProps) => {
    return (
        <MuiDialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            {children}
        </MuiDialog>
    );
};

const LogDetailsDialogHeader = ({ title = "Audit Log Details" }: LogDetailsDialogHeaderProps) => {
    return <DialogHeader title={title} />;
};

const LogDetailsDialogBody = () => {
    const auditLog = useSelectedAuditLog();

    if (!auditLog) {
        return (
            <DialogContent sx={contentStyles}>
                <Alert severity="info">No log details available.</Alert>
            </DialogContent>
        );
    }

    return (
        <DialogContent sx={contentStyles}>
            <Box>
                <SummarySection />
                <TechnicalDetailsSection />
            </Box>
        </DialogContent>
    );
};

const LogDetailsDialog = {
    Root: React.memo(LogDetailsDialogRoot),
    Header: React.memo(LogDetailsDialogHeader),
    Body: React.memo(LogDetailsDialogBody),
};

export default LogDetailsDialog;
