import { Root, createRoot } from "react-dom/client";

import { enqueueSnackbar } from "notistack";

import PageTransitionOverlay from "#root/components/PageTransitionOverlay";

interface CallWithTransitionProps<T = Record<string, unknown>, R = Error> {
    async_func: (body: { [key: string]: unknown }) => Promise<T>;
    func_on_init?: () => Promise<void>;
    func_on_completion?: () => Promise<void>;
    func_on_success?: (data: T) => Promise<void>;
    func_on_error?: (reason: R) => Promise<void>;
    eyebrowText: string;
    titleText: string;
    descriptionText: string;
    body?: { [key: string]: unknown };
    propagateError?: boolean;
    minDuration?: number;
    messageOnError?: string;
    onUpdateDescription?: (updateFn: (text: string) => void) => void;
}

const createTransitionOverlay = ({
    eyebrowText,
    titleText,
    descriptionText,
}: {
    eyebrowText: string;
    titleText: string;
    descriptionText: string;
}) => {
    if (typeof document === "undefined") {
        return {
            open: () => {},
            close: () => {},
            updateDescription: (_text: string) => {},
        };
    }

    const container = document.createElement("div");
    document.body.appendChild(container);

    const root: Root = createRoot(container);

    const renderOverlay = (text: string) => {
        root.render(
            <PageTransitionOverlay
                open={true}
                eyebrowText={eyebrowText}
                titleText={titleText}
                descriptionText={text}
            />
        );
    };

    return {
        open: () => renderOverlay(descriptionText),
        close: () => {
            root.unmount();
            container.remove();
        },
        updateDescription: (text: string) => renderOverlay(text),
    };
};

const CallApiWithTransitionComponent = async <T = Record<string, unknown>, R = Error>({
    async_func,
    body = {},
    func_on_success = async () => {},
    func_on_error = async () => {},
    func_on_completion = async () => {},
    eyebrowText,
    titleText,
    descriptionText,
    minDuration = 500,
    messageOnError = "Operation Failed.",
    onUpdateDescription,
    ...params
}: CallWithTransitionProps<T, R>) => {
    if (params?.func_on_init) await params.func_on_init();

    const transitionOverlay = createTransitionOverlay({
        eyebrowText,
        titleText,
        descriptionText,
    });

    transitionOverlay.open();

    if (onUpdateDescription) onUpdateDescription(transitionOverlay.updateDescription);

    const executeWithMinDuration = async () => {
        const getCurrentTime = () => Date.now();
        const startTime = getCurrentTime();
        const operationPromise = async_func(body);
        const promises: Promise<unknown>[] = [operationPromise];

        if (minDuration !== undefined && minDuration > 0) {
            const minDurationPromise = new Promise<void>((resolve) => {
                const checkDuration = () => {
                    const elapsed = getCurrentTime() - startTime;
                    const remaining = Math.max(0, minDuration - elapsed);
                    if (remaining > 0) {
                        setTimeout(resolve, remaining);
                    } else {
                        resolve();
                    }
                };
                checkDuration();
            });
            promises.push(minDurationPromise);
        }

        return await Promise.all(promises).then(() => operationPromise);
    };

    return await executeWithMinDuration()
        .then(async (res) => {
            await func_on_success(res);
            return res;
        })
        .catch(async (reason) => {
            await func_on_error(reason);
            enqueueSnackbar(
                `${messageOnError} ${reason}`, //

                { variant: "error" }
            );
            if (params?.propagateError) throw reason;
            return undefined;
        })
        .finally(async () => {
            transitionOverlay.close();
            await func_on_completion();
            return undefined;
        });
};

export default CallApiWithTransitionComponent;
