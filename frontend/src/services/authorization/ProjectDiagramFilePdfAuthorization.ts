import { IsAuthorized } from "#root/interfaces/authorization";

export class ProjectDiagramFilePdfAuthorization {
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
