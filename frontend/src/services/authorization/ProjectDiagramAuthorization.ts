import { IsAuthorized } from "#root/interfaces/authorization";

export class ProjectDiagramAuthorization {
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
