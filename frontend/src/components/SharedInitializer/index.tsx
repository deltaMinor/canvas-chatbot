import React from "react";

import ContextProgress from "#root/components/ContextProgress";

export interface InitializerProps {
    children?: React.ReactNode;
    blocking?: boolean;
    enabled?: boolean;
    refreshOnMount?: boolean;
    skip_fetch?: boolean;
}

interface InitializerLoader {
    init?: () => Promise<unknown>;
    onDisabled?: () => void;
    refresh?: (...args: never[]) => Promise<unknown>;
    syncAuthorization?: () => unknown;
}

interface SharedInitializerProps extends InitializerProps {
    loader: InitializerLoader;
    fallback?: React.ReactNode;
    storageKeys?: string[];
}

const SharedInitializerBody = ({
    children,
    blocking = false,
    enabled = true,
    refreshOnMount = false,
    skip_fetch = false,
    loader,
    fallback,
    storageKeys,
}: SharedInitializerProps) => {
    const [isInitializing, setIsInitializing] = React.useState(blocking && enabled);

    React.useEffect(() => {
        let cancelled = false;

        const stopInitializing = () => {
            if (!cancelled && blocking) {
                setIsInitializing(false);
            }
        };

        const initialize = async () => {
            if (!enabled) {
                loader.onDisabled?.();
                stopInitializing();
                return;
            }

            if (blocking) {
                setIsInitializing(true);
            }

            if (skip_fetch && !loader.syncAuthorization) {
                stopInitializing();
                return;
            }

            if (!skip_fetch && refreshOnMount && !loader.refresh) {
                stopInitializing();
                return;
            }

            if (!skip_fetch && !refreshOnMount && !loader.init) {
                stopInitializing();
                return;
            }

            if (skip_fetch && loader.syncAuthorization) {
                loader.syncAuthorization();
            } else if (refreshOnMount) {
                await loader.refresh?.();
            } else {
                await loader.init?.();
            }

            stopInitializing();
        };

        void initialize();

        if (!storageKeys?.length) {
            return () => {
                cancelled = true;
            };
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key && storageKeys.includes(event.key)) {
                void initialize();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            cancelled = true;
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [blocking, enabled, loader, refreshOnMount, skip_fetch, storageKeys]);

    if (blocking && enabled && isInitializing) {
        return <>{fallback ?? <ContextProgress />}</>;
    }

    return <>{children}</>;
};

export const SharedInitializer = React.memo(SharedInitializerBody);
export default SharedInitializer;
