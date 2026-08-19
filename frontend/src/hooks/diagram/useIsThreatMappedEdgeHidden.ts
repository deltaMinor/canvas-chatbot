import React from "react";

export const useIsThreatMappedEdgeHidden = (hiddenEdgeIdSet: Set<string>) =>
    React.useCallback((edgeId: string) => hiddenEdgeIdSet.has(edgeId), [hiddenEdgeIdSet]);

export default useIsThreatMappedEdgeHidden;
