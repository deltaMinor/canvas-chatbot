import React from "react";

import { GridRowParams, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid";

import FilesTable from "#root/components/FilesTable";
import { useProjectDiagramFileGeneratedJson } from "#root/hooks/backendHooks";
import { ProjectDiagramFile } from "#root/interfaces/common";
import {
    MuiFilterButtonStateProps,
    MuiFilterButtonValueProps,
} from "#root/interfaces/muiDataGridTable";

import {
    useProjectGeneratedJsonFileSelectedToolbarComponents,
    useProjectGeneratedJsonFileToolbarComponents,
} from "./ToolbarComponents";
import { getProjectGeneratedJsonFilesTableColumns } from "./columns";
import {
    defaultVisibleFields,
    getDiagramGeneratedJsonFilesDataGridProps,
    initProjectGeneratedJsonFilesTableRef,
} from "./constants";
import {
    getProjectGeneratedJsonFileDialogCustomProps,
    useProjectGeneratedJsonConfirmDialogProps,
} from "./dialogProps";
import { ProjectGeneratedJsonFilesTableRefObject } from "./interface";
import {
    getProjectGeneratedJsonFileInitRows,
    getProjectGeneratedJsonFileRowIdFromRow,
} from "./rows";

const DiagramGeneratedJsonFilesTableComponent = () => {
    const projectDiagramFileGeneratedJson = useProjectDiagramFileGeneratedJson();
    const tableRef = React.useRef<ProjectGeneratedJsonFilesTableRefObject>(
        initProjectGeneratedJsonFilesTableRef as ProjectGeneratedJsonFilesTableRefObject
    );

    const isRowSelectable = React.useCallback((_params: GridRowParams) => true, []);

    const useTableColumns = ({
        muiDataGridTableInstanceId,
    }: {
        muiDataGridTableInstanceId: string;
    }) => {
        return getProjectGeneratedJsonFilesTableColumns({
            tableRef,
            muiDataGridTableInstanceId,
        });
    };

    const useCustomDialogProps = () => {
        return getProjectGeneratedJsonFileDialogCustomProps({
            tableRef,
        });
    };

    const useToolbarComponents = (
        rows: GridValidRowModel[],
        filterButtonState: MuiFilterButtonStateProps,
        filterButtonValues: MuiFilterButtonValueProps
    ) => {
        return useProjectGeneratedJsonFileToolbarComponents({
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
        return useProjectGeneratedJsonFileSelectedToolbarComponents({
            rows,
            filterButtonState,
            filterButtonValues,
            tableRef,
        });
    };

    return (
        <FilesTable<ProjectDiagramFile, ProjectGeneratedJsonFilesTableRefObject>
            tableRef={tableRef}
            instanceId="diagram-generated-json-files-table"
            refRows={projectDiagramFileGeneratedJson?.files || []}
            defaultVisibleFields={defaultVisibleFields}
            dataGridProps={getDiagramGeneratedJsonFilesDataGridProps({ isRowSelectable })}
            getInitRows={getProjectGeneratedJsonFileInitRows}
            getRowIdFromRow={getProjectGeneratedJsonFileRowIdFromRow}
            useTableColumns={useTableColumns}
            useConfirmDialogProps={useProjectGeneratedJsonConfirmDialogProps}
            useCustomDialogProps={useCustomDialogProps}
            useToolbarComponents={useToolbarComponents}
            useSelectedToolbarComponents={useSelectedToolbarComponents}
        />
    );
};

export default React.memo(DiagramGeneratedJsonFilesTableComponent);
