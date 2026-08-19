import { getReasonPhrase } from "http-status-codes";
import { enqueueSnackbar } from "notistack";

import { ApiErrorResponse } from "#root/interfaces";
import { ServiceDomainProps } from "#root/interfaces/domain";
import app_store, { app_actions } from "#root/redux/store";

const DEFAULT_ERROR_CODE = 500;

export const processDomainFailure = (
    reason: ApiErrorResponse, //
    serviceDomainProps: ServiceDomainProps = {}
) => {
    const { hideSnackbar = false } = serviceDomainProps;
    const response_code =
        reason?.response?.data?.code || Number(reason?.code) || DEFAULT_ERROR_CODE;
    const response_message = reason?.response?.data?.message || "";
    const response_status_text = getReasonPhrase(response_code);

    const error_message = `[${response_code}] ${response_message || response_status_text}.`;
    if (!hideSnackbar) {
        enqueueSnackbar(error_message, { variant: "error" });
    }

    app_store.dispatch(
        app_actions.app.setErrorDetails([
            {
                code: response_code,
                message: response_message,
            },
        ])
    );
};
