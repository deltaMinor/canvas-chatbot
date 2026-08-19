import { ProjectStatusEnum } from "#root/interfaces/project";

/**
 * This stripped-down demo only ever works with a single project, so we use
 * a fixed id instead of a project list/dashboard. The backend auto-creates
 * this project document the first time it is requested.
 */
export const DEFAULT_PROJECT_ID = "project_17206c2a-06f8-49f1-b775-0e60adc22a74";

export const ProjectStatusBackgroundColorMapping = {
    [ProjectStatusEnum.ACTIVE]: "#4CAF50",
    // [ProjectStatusEnum.DISABLED]: "#22335410",
};

export const ProjectStatusColorMapping = {
    [ProjectStatusEnum.ACTIVE]: "#fff",
    // [ProjectStatusEnum.DISABLED]: "#223354",
};
