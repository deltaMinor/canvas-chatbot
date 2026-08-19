import React from "react";

export const useDragHandleRefs = () => {
    const dragHandleRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    const setRef = (element: HTMLDivElement | null, key: string) => {
        dragHandleRefs.current[key] = element;
    };

    return {
        dragHandleRefs: dragHandleRefs.current,
        setRef,
    };
};

export default useDragHandleRefs;
