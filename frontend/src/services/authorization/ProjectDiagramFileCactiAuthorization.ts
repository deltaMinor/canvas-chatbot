import { IsAuthorized } from "#root/interfaces/authorization";

export class ProjectDiagramFileCactiAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized = {
            create: true,
            read: true,
            update: false,
            delete: true,
        };

        return isAuthorized;
    }
}
