import { ProjectDiagram } from "#root/interfaces/diagram";
import {
    selectKbToscaLoader,
    selectMasterDiagramTemplatesLoader,
    selectProjectCactiLoader,
    selectProjectDiagramFileGeneratedJsonLoader,
    selectProjectDiagramFileJsonLoader,
    selectProjectDiagramFilePdfLoader,
    selectProjectDiagramImageFilesLoader,
    selectProjectDiagramLoader,
    selectProjectDiagramLogsLoader,
    selectProjectLoader,
    selectProjectLogsLoader,
    selectProjectModuleFileLoader,
    selectProjectTerraformFileLoader,
    selectProjectXMLLoader,
    selectProjectsLoader,
} from "#root/selectors/backendSelectors";

import { getRootStateFromStore } from "./root";

export const refreshProjects = async () =>
    await selectProjectsLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshKbTosca = async () =>
    await selectKbToscaLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshMasterDiagramTemplates = async () =>
    await selectMasterDiagramTemplatesLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshModuleFiles = async () =>
    await selectProjectModuleFileLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProject = async () =>
    await selectProjectLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectCacti = async () =>
    await selectProjectCactiLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagram = async () =>
    await selectProjectDiagramLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagramLogs = async () =>
    await selectProjectDiagramLogsLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagramFileJson = async () =>
    await selectProjectDiagramFileJsonLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagramFilePdf = async () =>
    await selectProjectDiagramFilePdfLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagramFileGeneratedJson = async () =>
    await selectProjectDiagramFileGeneratedJsonLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectDiagramImageFiles = async () =>
    await selectProjectDiagramImageFilesLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectXML = async () =>
    await selectProjectXMLLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshProjectLogs = async () =>
    await selectProjectLogsLoader(
        getRootStateFromStore() //
    ).refresh();

export const refreshTerraformFiles = async (projectDiagram?: ProjectDiagram | null) =>
    await selectProjectTerraformFileLoader(
        getRootStateFromStore() //
    ).refresh(projectDiagram);

/**
 * Composite refresh helpers
 */
