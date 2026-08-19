import React from "react";

import { GridRowParams, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";

import FilesTable from "#root/components/FilesTable";
import { useProjectDiagramFilePdf } from "#root/hooks/backendHooks";
import { ProjectDiagramFile } from "#root/interfaces/common";
import {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import {
    useProjectPdfFileSelectedToolbarComponents,
    useProjectPdfFileToolbarComponents,
} from "./ToolbarComponents";
import { getProjectPdfFilesTableColumns } from "./columns";
import {
    defaultVisibleFields,
    getDiagramPdfFilesDataGridProps,
    initProjectPdfFilesTableRef,
} from "./constants";
import {
    getProjectPdfFileDialogCustomProps,
    useProjectPdfConfirmDialogProps,
} from "./dialogProps";
import { ProjectPdfFilesTableRefObject } from "./interface";
import { getProjectPdfFileInitRows, getProjectPdfFileRowIdFromRow } from "./rows";

const DiagramPdfFilesTableComponent = () => {
    const projectDiagramFilePdf = useProjectDiagramFilePdf();
    const tableRef = React.useRef<ProjectPdfFilesTableRefObject>(
        initProjectPdfFilesTableRef as ProjectPdfFilesTableRefObject
    );

    const isRowSelectable = React.useCallback((_params: GridRowParams) => true, []);

    const useTableColumns = ({
        muiDataGridTableInstanceId,
    }: {
        muiDataGridTableInstanceId: string;
    }) => {
        return getProjectPdfFilesTableColumns({
            tableRef,
            muiDataGridTableInstanceId,
        });
    };

    const useCustomDialogProps = () => {
        return getProjectPdfFileDialogCustomProps({
            tableRef,
        });
    };

    const useToolbarComponents = (
        rows: GridValidRowModel[],
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps
    ) => {
        return useProjectPdfFileToolbarComponents({
            rows,
            filterButtonState,
            filterButtonValues,
            tableRef,
        });
    };

    const useSelectedToolbarComponents = (
        rows: GridValidRowModel[],
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps,
        _rowSelectionModel: GridRowSelectionModel
    ) => {
        return useProjectPdfFileSelectedToolbarComponents({
            rows,
            filterButtonState,
            filterButtonValues,
            tableRef,
        });
    };

    return (
        <FilesTable<ProjectDiagramFile, ProjectPdfFilesTableRefObject>
            tableRef={tableRef}
            instanceId="diagram-upload-pdf-files-table"
            refRows={projectDiagramFilePdf?.files || []}
            defaultVisibleFields={defaultVisibleFields}
            dataGridProps={getDiagramPdfFilesDataGridProps({ isRowSelectable })}
            getInitRows={getProjectPdfFileInitRows}
            getRowIdFromRow={getProjectPdfFileRowIdFromRow}
            useTableColumns={useTableColumns}
            useConfirmDialogProps={useProjectPdfConfirmDialogProps}
            useCustomDialogProps={useCustomDialogProps}
            useToolbarComponents={useToolbarComponents}
            useSelectedToolbarComponents={useSelectedToolbarComponents}
        />
    );
};

export default React.memo(DiagramPdfFilesTableComponent);
