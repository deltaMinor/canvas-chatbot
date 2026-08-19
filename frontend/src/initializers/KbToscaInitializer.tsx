import React from "react";

import { InitializerProps, SharedInitializer } from "#root/components/SharedInitializer";
import { useKbToscaLoader } from "#root/hooks/backendLoaderHooks";

const KbToscaInitializerComponent = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
}: InitializerProps) => {
    const loader = useKbToscaLoader();

    return (
        <SharedInitializer
            blocking={blocking}
            enabled={enabled}
            refreshOnMount={refreshOnMount}
            skip_fetch={skip_fetch}
            loader={loader}
        >
            {children}
        </SharedInitializer>
    );
};

export const KbToscaInitializer = React.memo(KbToscaInitializerComponent);
export default KbToscaInitializer;
