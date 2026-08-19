import { DataGridProps, GridInitialState } from "@mui/x-data-grid";

import { initMuiDataGridTableRef } from "#root/components/MuiDataGridTable/constants";

import { LogDialogTableRefObject } from "./interface";

export const defaultVisibleFields: string[] = [
    "action",
    "author",
    "description",
    "identifier",
    "summaryIdentifier",
    "timestamp",
    "timeAgo",
    "targetKey",
];

export const INITIAL_STATE: GridInitialState = {
    columns: {
        columnVisibilityModel: {
            identifier: false,
            timestamp: false,
            author: false,
            targetKey: false,
            action: true,
            description: true,
            timeAgo: true,
        },
    },
    pagination: {
        paginationModel: {
            pageSize: 10,
            page: 0,
        },
    },
};

export const getLogDialogTableDataGridProps = ({
    isRowSelectable,
}: {
    isRowSelectable: NonNullable<DataGridProps["isRowSelectable"]>;
}) => ({
    checkboxSelection: false,
    isRowSelectable,
    hideFooter: false,
    disableColumnMenu: true,
    pageSizeOptions: [5, 10, 25, 50, 100],
    initialState: {
        ...INITIAL_STATE,
        pagination: {
            paginationModel: {
                pageSize: 10,
                page: 0,
            },
        },
    },
});

export const initLogDialogTableRef: Partial<LogDialogTableRefObject> = {
    ...initMuiDataGridTableRef, //
};
