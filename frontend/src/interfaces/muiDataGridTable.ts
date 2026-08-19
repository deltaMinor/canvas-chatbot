import type React from "react";

import {
    DataGridProps,
    GridCallbackDetails,
    GridColDef,
    GridColumnVisibilityModel,
    GridRowParams,
    GridValidRowModel,
    MuiEvent,
} from "@mui/x-data-grid";
import type { GridApiCommunity } from "@mui/x-data-grid/internals";

import type { GetDialogProps } from "#root/interfaces/dataGrid";
import type { ConfirmDialogProps } from "#root/interfaces/dialogConfirm";
import type { DialogFieldProp } from "#root/interfaces/dialogField";
import type { LogDialogProps } from "#root/interfaces/logDialog";

export interface MuiDataGridTableRefObject extends GridApiCommunity {}

export type MuiDataGridTableRefInit = {};

export interface DialogCustomProps {
    stateKey: string;
    Component: (
        open: boolean //
    ) => React.ReactElement;
}

export interface MuiFilterButtonStateProps {
    [MuiFilterButtonKey.category]?: boolean;
    [MuiFilterButtonKey.groupLocation]?: boolean;
    [MuiFilterButtonKey.location]?: boolean;
    [MuiFilterButtonKey.source]?: boolean;
    [MuiFilterButtonKey.accepted]?: boolean;
    [MuiFilterButtonKey.completed]?: boolean;
    [MuiFilterButtonKey.hidden]?: boolean;
    [MuiFilterButtonKey.obsolete]?: boolean;
    [MuiFilterButtonKey.resolved]?: boolean;
    [MuiFilterButtonKey.showAll]?: boolean;
    [MuiFilterButtonKey.xMitreDomains]?: boolean;
    [MuiFilterButtonKey.projectStatus]?: boolean;
}

export interface MuiFilterButtonValueProps {
    [MuiFilterButtonKey.category]?: string;
    [MuiFilterButtonKey.groupLocation]?: string;
    [MuiFilterButtonKey.location]?: string;
    [MuiFilterButtonKey.source]?: string;
    [MuiFilterButtonKey.accepted]?: boolean;
    [MuiFilterButtonKey.completed]?: boolean;
    [MuiFilterButtonKey.hidden]?: boolean;
    [MuiFilterButtonKey.obsolete]?: boolean;
    [MuiFilterButtonKey.resolved]?: boolean;
    [MuiFilterButtonKey.showAll]?: boolean;
    [MuiFilterButtonKey.projectStatus]?: boolean;
    [MuiFilterButtonKey.xMitreDomains]?: string;
}

export enum MuiFilterButtonKey {
    category = "category",
    groupLocation = "groupLocation",
    location = "location",
    source = "source",
    accepted = "accepted",
    completed = "completed",
    hidden = "hidden",
    obsolete = "obsolete",
    resolved = "resolved",
    showAll = "showAll",
    xMitreDomains = "xMitreDomains",
    projectStatus = "projectStatus",
}

export interface MuiDataGridTableInstanceProps {
    muiDataGridTableInstanceId: string;
}

export interface MuiDataGridTableGetRowIdFromRowProps extends MuiDataGridTableInstanceProps {
    row: GridValidRowModel;
}

export interface MuiDataGridTableGetInitRowsProps<V> {
    refRows: V[];
}

export interface MuiDataGridTableGetFilteredRowsProps extends MuiDataGridTableInstanceProps {}

export interface MuiDataGridTableGetToolbarComponentsProps extends MuiDataGridTableInstanceProps {}

export interface MuiDataGridTableGetSelectedToolbarComponentsProps extends MuiDataGridTableGetToolbarComponentsProps {}

export interface MuiDataGridTableHandleRowDoubleClickProps extends MuiDataGridTableInstanceProps {
    d: GridCallbackDetails;
    e: MuiEvent<React.MouseEvent<HTMLElement, MouseEvent>>;
    p: GridRowParams;
}

export interface MuiDataGridTableHandleUpdateFilterButtonStateProps extends MuiDataGridTableInstanceProps {
    details: GridCallbackDetails;
    model: GridColumnVisibilityModel;
}

export type MuiDataGridTableCallbackHook<Props, Return> =
    | (() => (props: Props) => Return)
    | ((props: Props) => Return)
    | (() => Return);

export type MuiDataGridTableUseConfirmDialogProps = MuiDataGridTableCallbackHook<
    GetDialogProps,
    ConfirmDialogProps[]
>;

export type MuiDataGridTableUseCustomDialogProps = MuiDataGridTableCallbackHook<
    GetDialogProps,
    DialogCustomProps[]
>;

export type MuiDataGridTableUseFieldDialogProps = MuiDataGridTableCallbackHook<
    GetDialogProps,
    DialogFieldProp[]
>;

export type MuiDataGridTableUseFilteredRows = MuiDataGridTableCallbackHook<
    MuiDataGridTableGetFilteredRowsProps,
    GridValidRowModel[]
>;

export type MuiDataGridTableGetInitRows<V> = (
    props: MuiDataGridTableGetInitRowsProps<V>
) => GridValidRowModel[];

export type MuiDataGridTableUseLogDialogProps = MuiDataGridTableCallbackHook<
    GetDialogProps,
    LogDialogProps[]
>;

export type MuiDataGridTableUseSelectedToolbarComponents = MuiDataGridTableCallbackHook<
    MuiDataGridTableGetSelectedToolbarComponentsProps,
    React.ReactElement
>;

export type MuiDataGridTableUseTableColumns = MuiDataGridTableCallbackHook<
    MuiDataGridTableInstanceProps,
    GridColDef[]
>;

export type MuiDataGridTableUseToolbarComponents = MuiDataGridTableCallbackHook<
    MuiDataGridTableGetToolbarComponentsProps,
    React.ReactElement
>;

export interface MuiDataGridTableContentContextProps {
    dataGridProps?: Partial<DataGridProps>;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useFilteredRows: MuiDataGridTableUseFilteredRows;
}

export interface MuiDataGridTableProps<V> {
    dataGridProps?: Partial<DataGridProps>;
    defaultVisibleFields: string[];
    useAdvancedToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    useConfirmDialogProps?: MuiDataGridTableUseConfirmDialogProps;
    useCustomDialogProps?: MuiDataGridTableUseCustomDialogProps;
    useFieldDialogProps?: MuiDataGridTableUseFieldDialogProps;
    useFilteredRows?: MuiDataGridTableUseFilteredRows;
    getInitRows: MuiDataGridTableGetInitRows<V>;
    useLogDialogProps?: MuiDataGridTableUseLogDialogProps;
    getRowIdFromRow: (props: MuiDataGridTableGetRowIdFromRowProps) => string;
    useSelectedToolbarComponents?: MuiDataGridTableUseSelectedToolbarComponents;
    useTableColumns: MuiDataGridTableUseTableColumns;
    useToolbarComponents?: MuiDataGridTableUseToolbarComponents;
    handleRowDoubleClick?: (props: MuiDataGridTableHandleRowDoubleClickProps) => Promise<void>;
    handleUpdateFilterButtonStateOnModelChange?: (
        props: MuiDataGridTableHandleUpdateFilterButtonStateProps
    ) => Promise<void>;
    initFilterButtonState?: MuiFilterButtonStateProps;
    initFilterButtonValues?: MuiFilterButtonValueProps;
    loading?: boolean;
    noRowAlertMessage?: string;
    refRows: V[];
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    muiDataGridTableInstanceId?: string;
}
