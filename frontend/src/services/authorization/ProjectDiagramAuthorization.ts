import { IsAuthorized } from "#root/interfaces/authorization";

export class ProjectDiagramAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized: IsAuthorized = {
            create: false,
            read: true,
            update: true,
            delete: false,
        };

        // authorizationManager.updateIsAuthorizedFields<ProjectDiagram>(
        //     this.projectDiagram ?? ({} as ProjectDiagram),
        //     isAuthorized,
        //     user_permission_doc.project_diagram?.fields ?? {},
        //     this.projectId ?? ""
        // );

        return isAuthorized;
    }
}
