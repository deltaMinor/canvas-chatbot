import DeleteIcon from "@mui/icons-material/Delete";
import { GridValidRowModel } from "@mui/x-data-grid";

import MuiDataGridToolbarIconButton from "#root/components/MuiDataGridToolbarIconButton";
import { useDiagramCapabilitiesState } from "#root/hooks/diagram";
import {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";
import { handleOpenDialog } from "#root/stores/dialogStore";

import { deleteProjectGeneratedJsonFilesDialogConfirmStateKey } from "./constants";
import { ProjectGeneratedJsonFilesTableRefObject } from "./interface";

/**
 * This table is storage-only and populated automatically whenever
 * TopologyGenerator produces a new diagram -- users cannot upload files to
 * it directly, so there is no toolbar action here (unlike the PDF table's
 * upload button).
 */
export const useProjectGeneratedJsonFileToolbarComponents = (_props: {
    rows: GridValidRowModel[]; //
    filterButtonState: MuiFilterButtonStateProps;
    filterButtonValues: MuiFilterButtonValueProps;
    tableRef: React.RefObject<ProjectGeneratedJsonFilesTableRefObject>;
}) => {
    return <></>;
};

export const useProjectGeneratedJsonFileSelectedToolbarComponents = (_props: {
    rows: GridValidRowModel[]; //
    filterButtonState: MuiFilterButtonStateProps;
    filterButtonValues: MuiFilterButtonValueProps;
    tableRef: React.RefObject<ProjectGeneratedJsonFilesTableRefObject>;
}) => {
    const capabilities = useDiagramCapabilitiesState();

    const handleClickDelete = async () => {
        handleOpenDialog(deleteProjectGeneratedJsonFilesDialogConfirmStateKey);
    };

    return (
        <MuiDataGridToolbarIconButton
            tooltipTitle="Delete Existing Generated JSON File"
            title="Delete"
            color="error"
            startIcon={<DeleteIcon />}
            handleClick={() => handleClickDelete()}
            disabled={!capabilities.toolbar.deleteGeneratedJsonFile.enabled}
        />
    );
};
