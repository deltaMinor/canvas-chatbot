import React from "react";

import { useProjectCQ } from "#root/hooks/backendHooks";

/**
 * @deprecated Use useIsProjectCqCompleted (positive semantic) instead.
 *
 * Returns true when the diagram should be globally locked — that is, when the
 * Conception Questionnaire has NOT yet been submitted.
 *
 * The store-level equivalent is getIsDiagramLockedFromStore (canvas.ts).
 * Prefer getIsProjectCqCompletedFromStore for new store-level code.
 */
export const useIsDiagramLocked = (): boolean => {
    const projectCQ = useProjectCQ();
    return React.useMemo(() => !projectCQ?.isCompleted, [projectCQ?.isCompleted]);
};

export default useIsDiagramLocked;
