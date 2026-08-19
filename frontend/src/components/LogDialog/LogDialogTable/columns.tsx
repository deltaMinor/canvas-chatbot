import { GridColDef } from "@mui/x-data-grid";

import MuiChip from "#root/components/MuiChip";
import {
    AuditLogActionBackgroundColorMapping,
    AuditLogActionColorMapping,
} from "#root/constants/logs";
import { formatTargetKey } from "#root/utils/auditLogUtil";
import { convertTimezoneToSGT } from "#root/utils/genericHelper";

export const getLogColumns = (): GridColDef[] => [
    {
        field: "identifier",
        headerName: "Identifier",
        width: 250,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            return (
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{params.value}</span>
            );
        },
    },
    {
        field: "action",
        headerName: "Action",
        width: 180,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            const action = params.value;
            const color =
                AuditLogActionColorMapping?.[action as keyof typeof AuditLogActionColorMapping];
            const backgroundColor =
                AuditLogActionBackgroundColorMapping?.[
                    action as keyof typeof AuditLogActionBackgroundColorMapping
                ];

            return (
                <MuiChip
                    label={action}
                    isUpperCase
                    style={{
                        backgroundColor,
                        color,
                    }}
                />
            );
        },
    },
    {
        field: "targetKey",
        headerName: "Target Key",
        width: 250,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            const targetKey = formatTargetKey(params.value);
            return <span style={{ fontWeight: 500 }}>{targetKey}</span>;
        },
    },

    {
        field: "author",
        headerName: "Author",
        width: 150,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            return <span style={{ fontWeight: 500 }}>{params.value}</span>;
        },
    },
    {
        field: "timestamp",
        headerName: "Timestamp",
        width: 200,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            const formattedTimestamp = params.value ? convertTimezoneToSGT(params.value) : "N/A";

            return <span style={{ fontSize: "0.85rem", color: "#666" }}>{formattedTimestamp}</span>;
        },
    },
    {
        field: "description",
        headerName: "Description",
        width: 400,
        sortable: false,
        filterable: true,
        renderCell: (params) => {
            return (
                <span
                    style={{
                        fontSize: "0.9rem",
                        color: "#333",
                        lineHeight: "1.2",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                    title={params.value}
                >
                    {params.value}
                </span>
            );
        },
    },
    {
        field: "timeAgo",
        headerName: "Time Elapsed",
        width: 150,
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            return (
                <span
                    style={{
                        fontSize: "0.85rem",
                        color: "#888",
                        fontStyle: "italic",
                    }}
                >
                    {params.value}
                </span>
            );
        },
    },
];
