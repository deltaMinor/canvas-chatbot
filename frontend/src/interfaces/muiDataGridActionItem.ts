import { GridRowParams } from "@mui/x-data-grid";

export interface ActionItemComponentProps extends MuiDataGridActionItemProps {
    gridRowParams: GridRowParams;
}

export enum MuiDataGridAction {
    accept = "accept",
    delete = "delete",
    edit = "edit",
    hide = "hide",
    markDone = "markDone",
    markUndone = "markUndone",
    unhide = "unhide",
    view = "view",
}

export interface MuiDataGridActionItemProps {
    buttonTitle?: string;
    disabled?: boolean;
    hideIfDisabled?: boolean;
    tooltipTitle?: string;
    tooltipTitleAlt?: string;
    variant?: MuiDataGridActionItemVariant;
    ref?: Record<string, unknown>;
    getUrl?: (p: GridRowParams) => string | undefined;
    handleClick?: (p: GridRowParams) => Promise<void>;
    shouldDisable?: (p: GridRowParams) => boolean;
    shouldDisplayAlt?: (p: GridRowParams) => boolean;
}

export interface MuiDataGridActionItemColumnProps {
    hideIfDisabled?: boolean;
    actionItemProps?: {
        accept?: MuiDataGridActionItemProps;
        delete?: MuiDataGridActionItemProps;
        edit?: MuiDataGridActionItemProps;
        hide?: MuiDataGridActionItemProps;
        markDone?: MuiDataGridActionItemProps;
        markUndone?: MuiDataGridActionItemProps;
        unhide?: MuiDataGridActionItemProps;
        view?: MuiDataGridActionItemProps;
    };
}

export enum MuiDataGridActionItemVariant {
    icon = "icon",
    text = "text",
}
