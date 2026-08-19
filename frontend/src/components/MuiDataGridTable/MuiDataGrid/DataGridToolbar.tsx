import React from "react";

import { GridRowSelectionModel } from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

import { useMuiDataGridRowSelectionModel } from "#root/hooks/muiDataGridTable";

import DataGridToolbarDefaultWrapper from "./DataGridToolbarDefaultWrapper";

interface DataGridToolbarProps {
    apiRef: React.RefObject<GridApiCommunity>;
    rowCount: number;
    SlotToolbarDefaultComponents?: React.FC;
    SlotToolbarSelectedComponents?: React.FC<{
        rowSelectionModel: GridRowSelectionModel;
    }>;
    showAdvancedSidebar?: boolean;
}

const DataGridToolbarComponent: React.FC<DataGridToolbarProps> = ({
    // apiRef,
    rowCount,
    SlotToolbarDefaultComponents,
    SlotToolbarSelectedComponents,
    showAdvancedSidebar,
}) => {
    const rowSelectionModel = useMuiDataGridRowSelectionModel();

    return (
        <DataGridToolbarDefaultWrapper //
            rowCount={rowCount}
            {...(showAdvancedSidebar !== undefined && { showAdvancedSidebar })}
        >
            {!rowSelectionModel?.ids?.size && (
                <>
                    <div></div>
                    {!!SlotToolbarDefaultComponents && <SlotToolbarDefaultComponents />}
                </>
            )}
            {!!rowSelectionModel?.ids?.size && (
                <>
                    {!!SlotToolbarSelectedComponents && (
                        <SlotToolbarSelectedComponents rowSelectionModel={rowSelectionModel} />
                    )}
                </>
            )}
        </DataGridToolbarDefaultWrapper>
    );
};

export default React.memo(DataGridToolbarComponent);
