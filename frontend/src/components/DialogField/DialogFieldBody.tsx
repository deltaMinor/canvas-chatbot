import React from "react";

import {
    Alert,
    Box,
    Breakpoint,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import DialogConfirm from "#root/components/DialogConfirm";
import MuiDialogTitle from "#root/components/MuiDialogTitle";
import {
    DialogFieldProp,
    DialogFieldSubmitValues,
    DialogFieldValues,
} from "#root/interfaces/dialogField";
import { checkIfDialogFieldDirty, getHiddenStates } from "#root/utils/dialogFieldUtil";

import DialogFieldButton from "./DialogFieldButton";
import DialogFormField from "./DialogFormField";

const DEFAULT_TITLE = "Default Dialog Title";

const DEFAULT_WARNING_MESSAGE =
    "Editing is disabled. Please contact your administrator if you need to make changes.";

interface DialogFieldBodyProps {
    dialogFieldProp: DialogFieldProp;
    maxWidth: Breakpoint;
    closeRequestCount?: number;
    onClose: () => void;
}

const DialogFieldBodyComponent = ({
    dialogFieldProp, //
    maxWidth,
    closeRequestCount = 0,
    onClose,
}: DialogFieldBodyProps) => {
    const {
        data, //
        fields,
        message,
        buttonProps,
        warningMessage = DEFAULT_WARNING_MESSAGE,
        infoMessage = "",
        title = DEFAULT_TITLE,
        subtitle = "",
    } = dialogFieldProp;

    const getInitHiddenStates = () => {
        const defaultValues = fields?.reduce(
            (acc, f) => {
                if (!f?.defaultValue) return acc;
                acc[f.id] = f.defaultValue;
                return acc;
            },
            {} as Record<string, DialogFieldValues | DialogFieldValues[]>
        );
        return getHiddenStates(
            fields, //
            defaultValues
        );
    };

    // Hooks
    const [hiddenStates, setHiddenStates] =
        React.useState<Record<string, boolean>>(getInitHiddenStates());
    const [dirtyCloseConfirmOpen, setDirtyCloseConfirmOpen] = React.useState(false);
    const refValues = React.useRef<DialogFieldSubmitValues>({} as DialogFieldSubmitValues);
    const lastHandledCloseRequestCount = React.useRef(0);

    const smallFields = fields?.filter((f) => !f?.largeField);
    const largeFields = fields?.filter((f) => !!f?.largeField);

    const handleSetHiddenStates = (
        _hiddenStates: Record<string, boolean> //
    ) => {
        setHiddenStates(_hiddenStates);
    };

    const updateHiddenStates = () => {
        const _hiddenStates = getHiddenStates(
            fields, //
            refValues.current
        );
        handleSetHiddenStates(_hiddenStates);
    };

    const getSmallFieldGridSize = (_maxWidth?: Breakpoint) => {
        if (_maxWidth === "xl") return 4;
        if (_maxWidth === "lg") return 4;
        if (_maxWidth === "md") return 6;
        return 12;
    };
    const smallFieldGridSize = getSmallFieldGridSize(maxWidth);
    const allButtonProps = React.useMemo(
        () => [
            ...(buttonProps?.bottomLeft || []),
            ...(buttonProps?.bottomCenter || []),
            ...(buttonProps?.bottomRight || []),
        ],
        [buttonProps?.bottomCenter, buttonProps?.bottomLeft, buttonProps?.bottomRight]
    );
    const cancelButtonProp = allButtonProps.find((prop) => prop.buttonTitle === "Cancel");
    const saveButtonProp = allButtonProps.find((prop) => prop.buttonTitle === "Save");

    const shouldPromptDirtyClose = React.useCallback(() => {
        if (dialogFieldProp.promptSaveOnDirtyClose === false) return false;
        if (!saveButtonProp) return false;

        return checkIfDialogFieldDirty(dialogFieldProp.fields, refValues.current);
    }, [dialogFieldProp.fields, dialogFieldProp.promptSaveOnDirtyClose, saveButtonProp]);

    const handleDiscardClose = React.useCallback(async () => {
        if (!cancelButtonProp) {
            onClose();
            return;
        }

        await cancelButtonProp.handleClick(
            {} as React.MouseEvent<HTMLButtonElement, MouseEvent>,
            dialogFieldProp,
            refValues.current
        );
    }, [cancelButtonProp, dialogFieldProp, onClose]);

    const handleSaveClose = React.useCallback(async () => {
        if (!saveButtonProp) return;

        await saveButtonProp.handleClick(
            {} as React.MouseEvent<HTMLButtonElement, MouseEvent>,
            dialogFieldProp,
            refValues.current
        );
    }, [dialogFieldProp, saveButtonProp]);

    const handleRequestClose = React.useCallback(async () => {
        if (shouldPromptDirtyClose()) {
            setDirtyCloseConfirmOpen(true);
            return;
        }

        await handleDiscardClose();
    }, [handleDiscardClose, shouldPromptDirtyClose]);

    React.useEffect(() => {
        if (!closeRequestCount) return;
        if (closeRequestCount === lastHandledCloseRequestCount.current) return;

        lastHandledCloseRequestCount.current = closeRequestCount;
        void handleRequestClose();
    }, [closeRequestCount, handleRequestClose]);

    return (
        <>
            <DialogConfirm
                dialogConfirmProps={[
                    {
                        stateKey: "confirmDirtyDialogFieldBackdropClose",
                        title: "Save changes?",
                        message: "You have unsaved changes. Save before closing?",
                        onClick: handleSaveClose,
                        onClickNo: handleDiscardClose,
                        buttonLabelMapping: {
                            yes: "Save",
                            no: "Discard",
                        },
                        buttonProps: {
                            no: {
                                color: "error",
                            },
                        },
                    },
                ]}
                dialogConfirmState={{
                    confirmDirtyDialogFieldBackdropClose: dirtyCloseConfirmOpen,
                }}
                handleCloseDialogConfirm={() => setDirtyCloseConfirmOpen(false)}
            />
            <MuiDialogTitle //
                title={`${title || ""}`}
            >
                {!!subtitle && <Typography>{subtitle}</Typography>}
            </MuiDialogTitle>
            <DialogContent>
                {!!infoMessage && (
                    <Alert //
                        severity="info"
                    >
                        {infoMessage}
                    </Alert>
                )}
                {!!dialogFieldProp?.disabled && (
                    <Alert //
                        severity="warning"
                    >
                        {warningMessage}
                    </Alert>
                )}
                {!!data?.length && data?.[0] !== "" && (
                    <Box //
                        className="mb-2 h-full p-1"
                        style={{
                            backgroundColor: "#f2f5f9",
                        }}
                    >
                        {data?.map((d) => {
                            return typeof d === "string" && (d as string).slice(0, 4) === "http" ? (
                                <a
                                    key={d}
                                    style={{ margin: "0px" }}
                                    href={d}
                                >
                                    Generated Link
                                </a>
                            ) : (
                                <p
                                    key={d}
                                    style={{ margin: "0px" }}
                                >
                                    {d}
                                </p>
                            );
                        })}
                    </Box>
                )}
                {!!message && (
                    <Box className="py-2">
                        <DialogContentText>{message}</DialogContentText>
                    </Box>
                )}
                <form
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                    }}
                >
                    <Stack spacing={2}>
                        {!!smallFields?.length && (
                            <Grid
                                container //
                                columnSpacing={10}
                                rowSpacing={2}
                            >
                                {smallFields?.map((field, _fieldIdx) => {
                                    field.updateHiddenStates = updateHiddenStates;
                                    return (
                                        <Grid
                                            key={field.id} //
                                            size={smallFieldGridSize}
                                        >
                                            <DialogFormField
                                                field={field} //
                                                refValues={refValues}
                                                hiddenStates={hiddenStates}
                                                disabled={!!dialogFieldProp?.disabled}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                        {!!largeFields?.length && (
                            <Stack spacing={2}>
                                {largeFields.map((field, _fieldIdx) => {
                                    field.updateHiddenStates = updateHiddenStates;
                                    return (
                                        <DialogFormField
                                            key={field.id}
                                            field={field} //
                                            refValues={refValues}
                                            hiddenStates={hiddenStates}
                                            disabled={!!dialogFieldProp?.disabled}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                    </Stack>
                </form>
            </DialogContent>
            {(!!buttonProps?.bottomLeft?.length ||
                !!buttonProps?.bottomCenter?.length ||
                !!buttonProps?.bottomRight?.length) && (
                <DialogActions>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                        className="w-full"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <DialogFieldButton
                                dialogFieldProp={dialogFieldProp} //
                                dialogFieldButtonProps={buttonProps?.bottomLeft || []}
                                refValues={refValues}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <DialogFieldButton
                                dialogFieldProp={dialogFieldProp} //
                                dialogFieldButtonProps={buttonProps?.bottomCenter || []}
                                refValues={refValues}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <DialogFieldButton
                                dialogFieldProp={dialogFieldProp} //
                                dialogFieldButtonProps={buttonProps?.bottomRight || []}
                                refValues={refValues}
                            />
                        </Stack>
                    </Stack>
                </DialogActions>
            )}
        </>
    );
};

export default React.memo(DialogFieldBodyComponent);
