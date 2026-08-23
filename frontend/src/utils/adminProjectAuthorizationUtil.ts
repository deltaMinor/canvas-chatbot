export interface ProjectsAuthorizationState {
    isAuthorizedToCreateAny: boolean;
    isAuthorizedToDeleteAny: boolean;
    isAuthorizedToReadAny: boolean;
    isAuthorizedToUpdateAny: boolean;
}

export const getProjectsAuthorizationState = (): ProjectsAuthorizationState => {
    return {
        isAuthorizedToCreateAny: true,
        isAuthorizedToDeleteAny: true,
        isAuthorizedToReadAny: true,
        isAuthorizedToUpdateAny: true,
    };
};
