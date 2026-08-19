import React from "react";

import { useAuthorization, useProjectCQ, useProjectId } from "#root/hooks/backendHooks";

type AuthorizationValue = ReturnType<typeof useAuthorization>;

export const createStaticLoaderHook = <T>(LoaderClass: new () => T) => {
    return () => {
        return React.useMemo(() => new LoaderClass(), []);
    };
};

export const createAuthorizationLoaderHook = <T>(
    LoaderClass: new (authorization: AuthorizationValue) => T
) => {
    return () => {
        const authorization = useAuthorization();

        return React.useMemo(() => new LoaderClass(authorization), [authorization]);
    };
};

export const createAuthorizationUserLoaderHook = <T>(
    LoaderClass: new (authorization: AuthorizationValue, userId: string) => T
) => {
    return () => {
        const authorization = useAuthorization();
        const userId = authorization?.user_id ?? "";

        return React.useMemo(() => new LoaderClass(authorization, userId), [authorization, userId]);
    };
};

export const createAuthorizationProjectLoaderHook = <T>(
    LoaderClass: new (projectId: string) => T
) => {
    return () => {
        const projectId = useProjectId();

        return React.useMemo(() => new LoaderClass(projectId), [projectId]);
    };
};

export const createAuthorizationProjectUserLoaderHook = <T>(
    LoaderClass: new (authorization: AuthorizationValue, userId: string, projectId: string) => T
) => {
    return () => {
        const authorization = useAuthorization();
        const userId = authorization?.user_id ?? "";
        const projectId = useProjectId();

        return React.useMemo(
            () => new LoaderClass(authorization, userId, projectId),
            [authorization, userId, projectId]
        );
    };
};

export const createAuthorizationProjectCQSchemaLoaderHook = <T>(
    LoaderClass: new (authorization: AuthorizationValue, projectCQSchema: string) => T
) => {
    return () => {
        const authorization = useAuthorization();
        const projectCQSchema = `${useProjectCQ()?.schema_ ?? ""}`;

        return React.useMemo(
            () => new LoaderClass(authorization, projectCQSchema),
            [authorization, projectCQSchema]
        );
    };
};
