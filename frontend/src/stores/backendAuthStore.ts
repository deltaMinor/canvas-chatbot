import { KbToscaAuthorization } from "#root/services/authorization/KbToscaAuthorization";
import { MasterDiagramTemplatesAuthorization } from "#root/services/authorization/MasterDiagramTemplatesAuthorization";
import { ProjectAuthorization } from "#root/services/authorization/ProjectAuthorization";
import { ProjectDiagramAuthorization } from "#root/services/authorization/ProjectDiagramAuthorization";
import { ProjectDiagramFileCactiAuthorization } from "#root/services/authorization/ProjectDiagramFileCactiAuthorization";
import { ProjectDiagramFileImageAuthorization } from "#root/services/authorization/ProjectDiagramFileImageAuthorization";
import { ProjectDiagramFileJsonAuthorization } from "#root/services/authorization/ProjectDiagramFileJsonAuthorization";
import { ProjectDiagramFileModuleAuthorization } from "#root/services/authorization/ProjectDiagramFileModuleAuthorization";
import { ProjectDiagramFileTerraformAuthorization } from "#root/services/authorization/ProjectDiagramFileTerraformAuthorization";
import { ProjectDiagramFileXMLAuthorization } from "#root/services/authorization/ProjectDiagramFileXMLAuthorization";
import { ProjectDiagramLogsAuthorization } from "#root/services/authorization/ProjectDiagramLogsAuthorization";
import { ProjectLogsAuthorization } from "#root/services/authorization/ProjectLogsAuthorization";
import { ProjectsAuthorization } from "#root/services/authorization/ProjectsAuthorization";
import { getAuthorizationFromStore, getProjectIdFromStore } from "#root/stores/backendStore";

const DEFAULT_IS_AUTHORIZED = { create: null, read: null, update: null, delete: null };

// Project-scoped getters
export const getProjectIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectCactiIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileCactiAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectDiagramIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectDiagramLogsIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramLogsAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectDiagramFileIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileJsonAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectDiagramImageFilesIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileImageAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectXMLIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileXMLAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getProjectLogsIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectLogsAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getModuleFilesIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileModuleAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};
export const getTerraformFilesIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectDiagramFileTerraformAuthorization(auth, getProjectIdFromStore()).isAuthorized;
};

// Global getters
export const getKbToscaIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new KbToscaAuthorization(auth).isAuthorized;
};
export const getMasterDiagramTemplatesIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new MasterDiagramTemplatesAuthorization(auth).isAuthorized;
};
export const getProjectsIsAuthorizedFromStore = () => {
    const auth = getAuthorizationFromStore();
    if (!auth) return DEFAULT_IS_AUTHORIZED;
    return new ProjectsAuthorization(auth).isAuthorized;
};
