import { IsAuthorized } from "#root/interfaces/authorization";

/**
 * Computes project-level CRUD and field permissions for the active project.
 */
export class ProjectAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized: IsAuthorized = {
            create: false,
            read: true,
            update: false,
            delete: false,
        };

        // authorizationManager.updateIsAuthorizedFields<Project>(
        //     // Field-level permissions only make sense once a concrete project document exists.
        //     this.project ?? ({} as Project), //
        //     isAuthorized,
        //     user_permission_doc.project?.fields ?? {},
        //     this.projectId ?? ""
        // );

        return isAuthorized;
    }
}
