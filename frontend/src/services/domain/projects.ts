import { enqueueSnackbar } from "notistack";

import { ProjectProps } from "#root/interfaces/common";
import { ServiceDomainProps } from "#root/interfaces/domain";
import {
    ImportProject,
    Project,
    ProjectProgress,
    ProjectSettingsData,
} from "#root/interfaces/project";

import { ApplicationService } from "../api/application";

import { processDomainFailure } from "./helper";

export const getProjectFromApi = async (
    project_id: string, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    if (!project_id) return Promise.reject("project_id is undefined");
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.getProject({ project_id })
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project is retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.project;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const getAllProjectsFromApi = async (
    _props: {},
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.getAllProjects()
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Projects are retrieved successfully.", {
                    variant: "success",
                });
            return res?.data?.data?.projects;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectProgress = async (
    body: ProjectProps & { project_progress: Partial<ProjectProgress> }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.patchProjectProgress(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project status is updated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectSettings = async (
    body: ProjectProps & { project_settings: Partial<ProjectSettingsData> }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.patchProjectSettings(body)
        .then((res) => {
            if (!hideSnackbar)
                enqueueSnackbar("Project settings is updated successfully.", {
                    variant: "success",
                });
            return res?.data?.data;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const createProjectAdmin = async (
    body: Partial<Project>, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.postProjectAdmin(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("A new project is created successfully.", {
                    variant: "success",
                });
            return;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const duplicateProjectAdmin = async (
    body: Partial<Project>, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.duplicateProjectAdmin(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("A new project is duplicated successfully.", {
                    variant: "success",
                });
            return;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const importProjectAdmin = async (
    body: Partial<ImportProject>, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.importProjectAdmin(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("The project is imported successfully.", {
                    variant: "success",
                });
            return;
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const updateProjectAdmin = async (
    body: Partial<Project>, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.updateProjectAdmin(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("An existing project is updated successful.", {
                    variant: "success",
                });
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteProject = async (
    body: { project_id: string }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.deleteProjects({ project_id_list: [body.project_id] })
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("One project is deleted successfully.", {
                    variant: "success",
                });
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};

export const deleteProjects = async (
    body: { project_id_list: string[] }, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = true } = serviceDomainProps;
    const ApplicationApi = new ApplicationService();
    return await ApplicationApi.deleteProjects(body)
        .then(() => {
            if (!hideSnackbar)
                enqueueSnackbar("Projects are deleted successfully.", {
                    variant: "success",
                });
        })
        .catch((reason) => {
            processDomainFailure(reason, serviceDomainProps);
            return Promise.reject(reason);
        });
};
