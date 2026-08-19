import { GridValidRowModel } from "@mui/x-data-grid";
import { GridStateColDef } from "@mui/x-data-grid/internals";

export interface DataGridDict {
    allRows: GridValidRowModel[];
    selectedRowIdList: string[];
    visibleColumns: GridStateColDef[];
    visibleRowIdList: string[];
    visibleRows: GridValidRowModel[];
}

export interface RowStateMapping {
    [key: string]: {
        [key: string]: boolean;
    };
}

export enum GenericFieldsEnum {
    __check__ = "__check__",
    actions = "actions",
}

export interface GetDialogProps {
    muiDataGridTableInstanceId: string;
}
