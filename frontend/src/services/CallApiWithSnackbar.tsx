import { CircularProgress } from "@mui/material";
import { closeSnackbar, enqueueSnackbar } from "notistack";

import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { generateUUID } from "#root/utils/identifierUtil";

interface CallWithSnackbarProps<
    T = Record<string, unknown>, //
    R = Error,
> {
    async_func: (body: { [key: string]: unknown }) => Promise<T>;
    func_on_init?: () => Promise<void>;
    func_on_completion?: () => Promise<void>;
    func_on_success?: (data: T) => Promise<void>;
    func_on_error?: (reason: R) => Promise<void>;
    message?: string;
    disableMessage?: boolean;
    messageOnSuccess?: string;
    disableMessageOnSuccess?: boolean;
    messageOnError?: string;
    disableMessageOnError?: boolean;
    body?: { [key: string]: unknown };
    snackbarKey?: string;
    keepSnackbarOpen?: boolean;
    propagateError?: boolean;
    minDuration?: number; // Minimum duration in milliseconds
}

const CallApiWithSnackbarComponent = async <T = Record<string, unknown>, R = Error>({
    async_func,
    body = {},
    message = "Processing ...",
    messageOnSuccess = "Success.",
    messageOnError = "Operation Failed.",
    snackbarKey = generateUUID(UuidIdentifierKey.snackbar),
    keepSnackbarOpen = false,
    func_on_success = async () => {},
    func_on_error = async () => {},
    func_on_completion = async () => {},
    minDuration = 500, // 0.5 second
    ...params
}: CallWithSnackbarProps<T, R>) => {
    if (!!params?.func_on_init) await params.func_on_init();

    if (!params?.disableMessage) {
        closeSnackbar(snackbarKey);
        enqueueSnackbar(message, {
            key: snackbarKey,
            variant: "processing",
            iconComponent: (
                <CircularProgress
                    color="inherit"
                    size={20}
                />
            ),
            persist: true,
        });
    }

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
            if (keepSnackbarOpen) {
                closeSnackbar(snackbarKey);
            }
            if (!params?.disableMessageOnSuccess) {
                enqueueSnackbar(
                    `${messageOnSuccess}`, //
                    { variant: "success" }
                );
            }
            return res;
        })
        .catch(async (reason) => {
            await func_on_error(reason);
            closeSnackbar(snackbarKey);
            if (!params?.disableMessageOnError) {
                enqueueSnackbar(
                    `${messageOnError} ${reason}`, //
                    { variant: "error" }
                );
            }
            if (!!params?.propagateError) throw reason;
            return undefined;
        })
        .finally(async () => {
            if (!keepSnackbarOpen) closeSnackbar(snackbarKey);
            await func_on_completion();
            return undefined;
        });
};

export default CallApiWithSnackbarComponent;
