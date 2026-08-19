import React from "react";

import { Skeleton } from "@mui/material";

interface DebouncedTabPanelProps<T> {
    value: T;
    renderContent: (value: T) => React.ReactNode;
    debounceMs?: number;
    skeletonHeight?: number;
}

const DebouncedTabPanelComponent = <T,>({
    value,
    renderContent,
    debounceMs = 200,
    skeletonHeight = 480,
}: DebouncedTabPanelProps<T>) => {
    const [displayedValue, setDisplayedValue] = React.useState(value);
    const [isSwitching, setIsSwitching] = React.useState(false);

    React.useEffect(() => {
        if (Object.is(value, displayedValue)) {
            setIsSwitching(false);
            return;
        }

        setIsSwitching(true);

        const timeout = window.setTimeout(() => {
            setDisplayedValue(value);
            setIsSwitching(false);
        }, debounceMs);

        return () => window.clearTimeout(timeout);
    }, [debounceMs, displayedValue, value]);

    if (isSwitching) {
        return (
            <div className="px-2">
                <Skeleton
                    variant="rounded"
                    height={skeletonHeight}
                />
            </div>
        );
    }

    return <>{renderContent(displayedValue)}</>;
};

export default React.memo(DebouncedTabPanelComponent) as typeof DebouncedTabPanelComponent;
