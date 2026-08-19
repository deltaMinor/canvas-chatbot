import React from "react";

import ContextProgress from "#root/components/ContextProgress";
import LoadErrorPage from "#root/components/LoadErrorPage";

interface FeatureGateProps {
    children?: React.ReactNode;
    isAuthorizedToRead?: boolean;
    loaded: boolean;
    loadError?: boolean;
    title?: string;
    message?: string;
    unauthorizedFallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    persistAfterFirstLoad?: boolean;
}

const FeatureGateComponent = ({
    children,
    isAuthorizedToRead = true,
    loaded,
    loadError = false,
    title = "Failed to load content",
    message = "ThreatMirror could not load the required data.",
    unauthorizedFallback = null,
    loadingFallback,
    errorFallback,
    persistAfterFirstLoad = true,
}: FeatureGateProps) => {
    const [hasCompletedFirstLoad, setHasCompletedFirstLoad] = React.useState(false);

    React.useEffect(() => {
        if (!persistAfterFirstLoad || !loaded) return;

        setHasCompletedFirstLoad(true);
    }, [loaded, persistAfterFirstLoad]);

    const effectiveLoaded = loaded || (persistAfterFirstLoad && hasCompletedFirstLoad);
    const effectiveLoadError = (!persistAfterFirstLoad || !hasCompletedFirstLoad) && loadError;

    if (!isAuthorizedToRead) {
        return <>{unauthorizedFallback}</>;
    }

    if (effectiveLoadError) {
        return (
            <>
                {errorFallback ?? (
                    <LoadErrorPage
                        title={title}
                        message={message}
                    />
                )}
            </>
        );
    }

    if (!effectiveLoaded) {
        return <>{loadingFallback ?? <ContextProgress />}</>;
    }

    return <>{children}</>;
};

export type { FeatureGateProps };
export default React.memo(FeatureGateComponent);
