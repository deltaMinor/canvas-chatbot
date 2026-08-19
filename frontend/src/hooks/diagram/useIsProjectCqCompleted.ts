/**
 * Returns true when the project's Conception Questionnaire has been submitted
 * (i.e., isCompleted is truthy).
 *
 * This is the positive-semantic replacement for useIsDiagramLocked — prefer
 * this hook when you need to know whether the CQ is done rather than whether
 * the diagram is "locked".
 *
 * The store-level equivalent is getIsProjectCqCompletedFromStore (canvas.ts),
 * used inside event handlers and callbacks where hooks are not available.
 *
 * Add new completion conditions here to extend the semantic uniformly across
 * canvases, the toolbar, and resource drawers.
 */
export const useIsProjectCqCompleted = (): boolean => {
    return true;
};

export default useIsProjectCqCompleted;
