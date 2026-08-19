import { IsAuthorized } from "#root/interfaces/authorization";

export class MasterDiagramTemplatesAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized = {
            create: null,
            read: true,
            update: null,
            delete: null,
        };

        return isAuthorized;
    }
}
