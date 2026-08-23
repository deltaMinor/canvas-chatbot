import { IsAuthorized } from "#root/interfaces/authorization";

export class MasterDiagramTemplatesAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized = {
            create: true,
            read: true,
            update: true,
            delete: true,
        };

        return isAuthorized;
    }
}
