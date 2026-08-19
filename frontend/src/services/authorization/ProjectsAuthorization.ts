import { IsAuthorized } from "#root/interfaces/authorization";
import {
    ProjectsAuthorizationState,
    getProjectsAuthorizationState,
} from "#root/utils/adminProjectAuthorizationUtil";

/**
 * Computes access for the projects resource.
 */
export class ProjectsAuthorization {
    constructor() {}

    get state(): ProjectsAuthorizationState {
        return getProjectsAuthorizationState();
    }

    get isAuthorized(): IsAuthorized {
        const {
            isAuthorizedToCreateAny,
            isAuthorizedToDeleteAny,
            isAuthorizedToReadAny,
            isAuthorizedToUpdateAny,
        } = this.state;
        const isAuthorized = {
            create: isAuthorizedToCreateAny,
            read: isAuthorizedToReadAny,
            update: isAuthorizedToUpdateAny,
            delete: isAuthorizedToDeleteAny,
        };

        return isAuthorized;
    }
}
