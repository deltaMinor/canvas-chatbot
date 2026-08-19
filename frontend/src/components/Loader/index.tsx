import React from "react";

import SuspenseLoader from "#root/components/SuspenseLoader";

const Loader = <T extends object>(Component: React.ComponentType<T>) => {
    const WrappedComponent = (props: T) => (
        <React.Suspense fallback={<SuspenseLoader />}>
            <Component {...props} />
        </React.Suspense>
    );

    WrappedComponent.displayName = `Loader(${Component.displayName || Component.name || "Component"})`;

    return WrappedComponent;
};

export default Loader;
