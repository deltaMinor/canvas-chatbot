import React from "react";

import DialogConfirm from "#root/components/DialogConfirm";
import MuiButton from "#root/components/MuiButton";
import {
    DialogFieldButtonProps,
    DialogFieldProp,
    DialogFieldSubmitValues,
} from "#root/interfaces/dialogField";
import { checkIfDialogFieldDirty } from "#root/utils/dialogFieldUtil";

interface DialogFieldButtonComponentProps {
    dialogFieldProp: DialogFieldProp;
    dialogFieldButtonProps: DialogFieldButtonProps[];
    refValues: React.RefObject<DialogFieldSubmitValues>;
}

const DialogFieldButtonComponent = ({
    dialogFieldProp,
    dialogFieldButtonProps, //
    refValues,
}: DialogFieldButtonComponentProps) => {
    const [dirtyCloseConfirmOpen, setDirtyCloseConfirmOpen] = React.useState(false);
    const cancelButtonProp = dialogFieldButtonProps?.find((prop) => prop.buttonTitle === "Cancel");
    const saveButtonProp = dialogFieldButtonProps?.find((prop) => prop.buttonTitle === "Save");
    const shouldPromptDirtyClose = React.useCallback(
        (buttonTitle: string) => {
            if (buttonTitle !== "Cancel") return false;
            if (dialogFieldProp.promptSaveOnDirtyClose === false) return false;
            if (!saveButtonProp) return false;
            return checkIfDialogFieldDirty(dialogFieldProp.fields, refValues.current);
        },
        [dialogFieldProp.fields, dialogFieldProp.promptSaveOnDirtyClose, refValues, saveButtonProp]
    );

    const handleConfirmSave = React.useCallback(async () => {
        await saveButtonProp?.handleClick(
            {} as React.MouseEvent<HTMLButtonElement, MouseEvent>,
            dialogFieldProp,
            refValues.current
        );
    }, [dialogFieldProp, refValues, saveButtonProp]);

    const handleConfirmDiscard = React.useCallback(async () => {
        await cancelButtonProp?.handleClick(
            {} as React.MouseEvent<HTMLButtonElement, MouseEvent>,
            dialogFieldProp,
            refValues.current
        );
    }, [cancelButtonProp, dialogFieldProp, refValues]);

    return (
        <>
            <DialogConfirm
                dialogConfirmProps={[
                    {
                        stateKey: "confirmDirtyDialogFieldClose",
                        title: "Save changes?",
                        message: "You have unsaved changes. Save before closing?",
                        onClick: handleConfirmSave,
                        onClickNo: handleConfirmDiscard,
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
                    confirmDirtyDialogFieldClose: dirtyCloseConfirmOpen,
                }}
                handleCloseDialogConfirm={() => setDirtyCloseConfirmOpen(false)}
            />
            {dialogFieldButtonProps?.map(
                (
                    {
                        buttonTitle, //
                        handleClick,
                        ...props
                    },
                    buttonIdx
                ) => {
                    return (
                        <MuiButton
                            key={buttonIdx}
                            disabled={
                                !!dialogFieldProp?.disabled || //
                                !!props?.disabled
                            }
                            onClick={(ev) => {
                                if (shouldPromptDirtyClose(buttonTitle)) {
                                    setDirtyCloseConfirmOpen(true);
                                    return;
                                }
                                handleClick(
                                    ev, //
                                    dialogFieldProp,
                                    refValues.current
                                );
                            }}
                            {...props}
                        >
                            {buttonTitle}
                        </MuiButton>
                    );
                }
            )}
        </>
    );
};

export default React.memo(DialogFieldButtonComponent);
