import { DiagramEdge } from "#root/interfaces/diagram";
import { appendToProjectLocalStorage, getFromProjectLocalStorage } from "#root/utils/localStorage";

export const THREAT_MAPPED_EDGE_VISIBILITY_STORAGE_KEY = "threatMappedEdgeVisibility";
export const THREAT_MAPPED_EDGE_VISIBILITY_EVENT = "threat-mapped-edge-visibility-change";

interface ThreatMappedEdgeVisibilityPreference {
    projectId: string;
    hiddenEdgeIds: string[];
}

export const getThreatMappedEdgeVisibilityId = (
    edge:
        | DiagramEdge
        | {
              id?: string;
              data?: Record<string, unknown>;
          }
) => String(edge?.data?.["originalEdgeId"] || edge?.id || "");

export const getThreatMappedEdgeVisibilityPreference = (
    projectId: string
): ThreatMappedEdgeVisibilityPreference => {
    const storedPreference =
        (getFromProjectLocalStorage(projectId, THREAT_MAPPED_EDGE_VISIBILITY_STORAGE_KEY) as
            | ThreatMappedEdgeVisibilityPreference
            | undefined) ?? undefined;

    return {
        projectId,
        hiddenEdgeIds: Array.from(
            new Set(
                (storedPreference?.hiddenEdgeIds ?? [])
                    .map((edgeId) => `${edgeId || ""}`.trim())
                    .filter(Boolean)
            )
        ),
    };
};

export const setThreatMappedEdgeVisibilityPreference = (
    projectId: string,
    hiddenEdgeIds: string[]
) => {
    const nextPreference = {
        projectId,
        hiddenEdgeIds: Array.from(
            new Set(hiddenEdgeIds.map((edgeId) => `${edgeId}`.trim()).filter(Boolean))
        ),
    };

    appendToProjectLocalStorage(
        projectId,
        THREAT_MAPPED_EDGE_VISIBILITY_STORAGE_KEY,
        nextPreference
    );

    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent(THREAT_MAPPED_EDGE_VISIBILITY_EVENT, {
                detail: nextPreference,
            })
        );
    }

    return nextPreference;
};

export const toggleThreatMappedEdgeVisibilityPreference = (projectId: string, edgeId: string) => {
    const normalizedEdgeId = `${edgeId || ""}`.trim();

    if (!projectId || !normalizedEdgeId) {
        return getThreatMappedEdgeVisibilityPreference(projectId);
    }

    const currentPreference = getThreatMappedEdgeVisibilityPreference(projectId);
    const hiddenEdgeIdSet = new Set(currentPreference.hiddenEdgeIds);

    if (hiddenEdgeIdSet.has(normalizedEdgeId)) {
        hiddenEdgeIdSet.delete(normalizedEdgeId);
    } else {
        hiddenEdgeIdSet.add(normalizedEdgeId);
    }

    return setThreatMappedEdgeVisibilityPreference(projectId, Array.from(hiddenEdgeIdSet));
};
