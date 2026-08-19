import React from "react";

import { Alert } from "@mui/material";

import FeatureGate, { FeatureGateProps } from "#root/components/FeatureGate";
import MuiSkeleton from "#root/components/MuiSkeleton";

interface InPageFeatureGateProps extends FeatureGateProps {
    minHeight?: number | string;
    wrapperClassName?: string;
    showLoadingFallback?: boolean;
}

const InPageFeatureGateComponent = ({
    children,
    title = "Failed to load content",
    message = "ThreatMirror could not load the required data.",
    loadingFallback,
    errorFallback,
    minHeight = 160,
    wrapperClassName = "mb-2 pl-3",
    showLoadingFallback = true,
    ...props
}: InPageFeatureGateProps) => {
    return (
        <FeatureGate
            {...props}
            title={title}
            message={message}
            errorFallback={
                errorFallback ?? (
                    <div className={wrapperClassName}>
                        <Alert
                            severity="error"
                            className="px-2"
                        >
                            {message || title}
                        </Alert>
                    </div>
                )
            }
            loadingFallback={
                showLoadingFallback
                    ? (loadingFallback ?? (
                          <div className={wrapperClassName}>
                              <MuiSkeleton
                                  variant="rectangular"
                                  minHeight={minHeight}
                              />
                          </div>
                      ))
                    : loadingFallback
            }
        >
            {children}
        </FeatureGate>
    );
};

export type { InPageFeatureGateProps };
export default React.memo(InPageFeatureGateComponent);
