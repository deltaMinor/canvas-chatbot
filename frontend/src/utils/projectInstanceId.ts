import { getRouteProjectIdFromWindow } from "#root/redux/backendSlice";

const PROJECT_INSTANCE_SEPARATOR = "::";
const DEFAULT_INSTANCE_SEGMENT = "default";

const getProjectInstancePrefix = (featureKey: string, projectId?: string) => {
    const resolvedProjectId = projectId || getRouteProjectIdFromWindow() || "";
    return resolvedProjectId
        ? `${resolvedProjectId}${PROJECT_INSTANCE_SEPARATOR}${featureKey}${PROJECT_INSTANCE_SEPARATOR}`
        : `${featureKey}${PROJECT_INSTANCE_SEPARATOR}`;
};

export const buildProjectFeatureInstanceId = ({
    featureKey,
    instanceId,
    projectId,
}: {
    featureKey: string;
    instanceId?: string | undefined;
    projectId?: string | undefined;
}) => {
    const normalizedInstanceId = instanceId || DEFAULT_INSTANCE_SEGMENT;
    return `${getProjectInstancePrefix(featureKey, projectId)}${normalizedInstanceId}`;
};

export const ensureProjectFeatureInstanceId = ({
    featureKey,
    instanceId,
    projectId,
}: {
    featureKey: string;
    instanceId?: string | undefined;
    projectId?: string | undefined;
}) => {
    const prefix = getProjectInstancePrefix(featureKey, projectId);

    if (instanceId?.startsWith(prefix)) {
        return instanceId;
    }

    return buildProjectFeatureInstanceId({
        featureKey,
        instanceId,
        projectId,
    });
};

export const resolveProjectFeatureInstanceId = ({
    featureKey,
    instanceId,
    projectId,
}: {
    featureKey: string;
    instanceId?: string | undefined;
    projectId?: string | undefined;
}) => {
    return ensureProjectFeatureInstanceId({
        featureKey,
        instanceId,
        projectId,
    });
};
