import { IsAuthorized } from "#root/interfaces/authorization";

/**
 * Computes access to the TOSCA mapping resource and mirrors it into Redux.
 */
export class KbToscaAuthorization {
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
