import { IsAuthorized } from "#root/interfaces/authorization";

/**
 * Computes access to the TOSCA mapping resource and mirrors it into Redux.
 */
export class KbToscaAuthorization {
    constructor() {}

    get isAuthorized(): IsAuthorized {
        const isAuthorized = {
            create: false,
            read: true,
            update: false,
            delete: false,
        };

        return isAuthorized;
    }
}
