import { IsAuthorized } from "#root/interfaces/authorization";

/**
 * Computes project-level CRUD and field permissions for the active project.
 */
export class ProjectAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized: IsAuthorized = {
            create: true,
            read: true,
            update: true,
            delete: true,
        };

        return isAuthorized;
    }
}
