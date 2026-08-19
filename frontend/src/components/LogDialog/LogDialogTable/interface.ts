import { DefaultContextProviderProps } from "#root/interfaces";
import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";

export interface LogDialogTableRefObject extends MuiDataGridTableRefObject {
    // Add any specific log table methods if needed
}

export interface LogDialogTableContextObject extends DefaultContextProviderProps<LogDialogTableRefObject> {
    // Add any specific context properties if needed
}
