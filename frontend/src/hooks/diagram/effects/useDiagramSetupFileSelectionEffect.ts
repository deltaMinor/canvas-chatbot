import React from "react";
import { useDispatch } from "react-redux";

import { useModuleFiles, useProjectDiagram, useTerraformFiles } from "#root/hooks/backendHooks";
import { ProjectDiagramFile } from "#root/interfaces/common";
import { app_actions } from "#root/redux/store";

const withSelectedModuleFiles = (
    projectDiagramFileModule: ProjectDiagramFile[],
    selectedModuleFileIdList: string[]
) =>
    projectDiagramFileModule.map((file) => ({
        ...file,
        selected: selectedModuleFileIdList.length
            ? selectedModuleFileIdList.includes(file.file_id || "")
            : true,
    }));

const withSelectedTerraformFiles = (
    projectDiagramFileTerraform: ProjectDiagramFile[],
    selectedTerraformFileIdList: string[]
) =>
    projectDiagramFileTerraform.map((file) => ({
        ...file,
        selected: selectedTerraformFileIdList.length
            ? selectedTerraformFileIdList.includes(file.file_id || "")
            : true,
    }));

export const useDiagramSetupFileSelectionEffect = () => {
    const dispatch = useDispatch();
    const projectDiagramFileModule = useModuleFiles();
    const projectDiagramFileTerraform = useTerraformFiles();
    const projectDiagram = useProjectDiagram();
    const selectedModuleFileIdList = projectDiagram?.ref?.selected_module_file_id_list || [];
    const selectedTerraformFileIdList = projectDiagram?.ref?.selected_terraform_file_id_list || [];

    const nextModuleFiles = React.useMemo(
        () => withSelectedModuleFiles(projectDiagramFileModule, selectedModuleFileIdList),
        [projectDiagramFileModule, selectedModuleFileIdList]
    );
    const nextTerraformFiles = React.useMemo(
        () => withSelectedTerraformFiles(projectDiagramFileTerraform, selectedTerraformFileIdList),
        [selectedTerraformFileIdList, projectDiagramFileTerraform]
    );

    const projectDiagramFileModuleJson = React.useMemo(
        () => JSON.stringify(projectDiagramFileModule),
        [projectDiagramFileModule]
    );
    const nextModuleFilesJson = React.useMemo(
        () => JSON.stringify(nextModuleFiles),
        [nextModuleFiles]
    );
    const projectDiagramFileTerraformJson = React.useMemo(
        () => JSON.stringify(projectDiagramFileTerraform),
        [projectDiagramFileTerraform]
    );
    const nextTerraformFilesJson = React.useMemo(
        () => JSON.stringify(nextTerraformFiles),
        [nextTerraformFiles]
    );

    React.useEffect(() => {
        if (projectDiagramFileModuleJson === nextModuleFilesJson) {
            return;
        }

        dispatch(app_actions.backend.setProjectDiagramFileModule(nextModuleFiles));
    }, [dispatch, projectDiagramFileModuleJson, nextModuleFiles, nextModuleFilesJson]);

    React.useEffect(() => {
        if (projectDiagramFileTerraformJson === nextTerraformFilesJson) {
            return;
        }

        dispatch(app_actions.backend.setProjectDiagramFileTerraform(nextTerraformFiles));
    }, [dispatch, nextTerraformFiles, nextTerraformFilesJson, projectDiagramFileTerraformJson]);
};
