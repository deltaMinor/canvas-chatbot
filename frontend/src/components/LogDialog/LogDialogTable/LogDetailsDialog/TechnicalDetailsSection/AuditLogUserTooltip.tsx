import React from "react";

import { Typography } from "@mui/material";

import { AuditLog } from "#root/interfaces";

interface AuditLogUserTooltipProps {
    auditLog: AuditLog;
}

const AuditLogUserTooltip: React.FC<AuditLogUserTooltipProps> = ({ auditLog }) => {
    return (
        <>
            <Typography>{`username: ${auditLog?.username}`}</Typography>
            <Typography>{`user_id: ${auditLog?.user_id}`}</Typography>
        </>
    );
};

export default React.memo(AuditLogUserTooltip);
