import React from "react";

interface UseDebouncedCallbackOptions {
    preAction?: () => void;
    postAction?: () => void;
}

export const useDebouncedCallback = <TArgs extends unknown[]>(
    callback: (...args: TArgs) => void | Promise<void>,
    delay = 250,
    options?: UseDebouncedCallbackOptions
) => {
    const callbackRef = React.useRef(callback);
    const preActionRef = React.useRef(options?.preAction);
    const postActionRef = React.useRef(options?.postAction);
    const timeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    React.useEffect(() => {
        preActionRef.current = options?.preAction;
        postActionRef.current = options?.postAction;
    }, [options?.postAction, options?.preAction]);

    const cancel = React.useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            postActionRef.current?.();
        }
    }, []);

    const debouncedCallback = React.useCallback(
        (...args: TArgs) => {
            const isStartingNewDebounce = timeoutRef.current === null;
            cancel();
            if (isStartingNewDebounce) {
                preActionRef.current?.();
            }
            timeoutRef.current = window.setTimeout(() => {
                Promise.resolve()
                    .then(() => callbackRef.current(...args))
                    .finally(() => {
                        timeoutRef.current = null;
                        postActionRef.current?.();
                    });
            }, delay);
        },
        [cancel, delay]
    );

    React.useEffect(() => cancel, [cancel]);

    return { debouncedCallback, cancel };
};

export default useDebouncedCallback;
