import { useDiagramCapabilities } from "#root/hooks/diagram/useDiagramCapabilities";

/**
 * Mounts useDiagramCapabilities purely for its Redux-sync side-effect.
 * Call this from body-effects components (DiagramEditorBodyEffects,
 * DiagramJoyrideBodyEffects, DiagramVisualizerBodyEffects) to ensure the
 * Redux capabilities state stays current even in views where the toolbar
 * is not rendered.
 */
export const useDiagramCapabilitiesSyncEffect = () => {
    useDiagramCapabilities();
};

export default useDiagramCapabilitiesSyncEffect;
