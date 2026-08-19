import React from "react";

import {
    DataGridProps,
    GridCallbackDetails,
    GridColDef,
    GridColumnVisibilityModel,
    GridEventListener,
    GridRowSelectionModel,
    GridValidRowModel,
} from "@mui/x-data-grid";

import { MuiDataGridTableRefObject } from "#root/interfaces/muiDataGridTable";

import MuiDataGridTable from "./MuiDataGridTable";

export interface MuiDataGridProps {
    loading?: boolean;
    apiRef: React.RefObject<MuiDataGridTableRefObject>;
    columns: GridColDef<GridValidRowModel>[];
    rows: GridValidRowModel[];
    SlotToolbarDefaultComponents?: React.FC | undefined;
    SlotToolbarSelectedComponents?:
        | React.FC<{
              rowSelectionModel: GridRowSelectionModel;
          }>
        | undefined;
    SlotToolbarAdvancedComponents?: React.FC | undefined;
    handleRowDoubleClick?: GridEventListener<"rowDoubleClick">;
    handleStateChange?: GridEventListener<"stateChange">;
    handleRowSelectionModelChange?: (
        rowSelectionModel: GridRowSelectionModel, //
        details: GridCallbackDetails
    ) => void;
    handleColumnVisibilityModelChange?: (
        model: GridColumnVisibilityModel, //
        details: GridCallbackDetails
    ) => void;
    //
    dataGridProps?: Partial<DataGridProps>;
}

const MuiDataGridComponent = ({
    apiRef,
    dataGridProps = {},
    ...props //
}: MuiDataGridProps) => {
    return (
        <>
            <MuiDataGridTable
                apiRef={apiRef}
                dataGridProps={dataGridProps}
                {...props}
            />
        </>
    );
};

export default MuiDataGridComponent;
