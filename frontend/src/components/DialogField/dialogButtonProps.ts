import { enqueueSnackbar } from "notistack";

import { CloseDialogFieldEventHandler } from "#root/interfaces/dialog";
import { DialogFieldProp } from "#root/interfaces/dialogField";
import { runDialogFieldValuesCheck } from "#root/utils/dialogFieldUtil";

export const useDefaultFieldButtonProps = ({
    handleCloseDialogField,
    handleSave,
    handleClose,
    disabled,
}: {
    handleCloseDialogField: CloseDialogFieldEventHandler; //
    handleSave: (v: { [key: string]: unknown }) => Promise<void>;
    handleClose?: () => Promise<void>;
    disabled?: boolean;
}) => {
    const handleClickCancel = async (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        _dialogFieldProp: DialogFieldProp,
        _values?: { [key: string]: unknown }
    ) => {
        handleCloseDialogField(); //
        if (!!handleClose) handleClose();
    };

    const handleClickSave = async (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //
        dialogFieldProp: DialogFieldProp,
        values?: { [key: string]: unknown }
    ) => {
        try {
            if (!values || !Object.keys(values)?.length) {
                throw new Error("All fields are undefined.");
            }
            runDialogFieldValuesCheck(dialogFieldProp?.fields, values);
            await handleSave(values);
        } catch (e) {
            enqueueSnackbar(`${e}`, { variant: "error" });
            return;
        }
        if (!!dialogFieldProp?.disableCloseDialogOnClick) return;
        handleCloseDialogField();
    };

    return {
        bottomLeft: [],
        bottomCenter: [],
        bottomRight: [
            {
                buttonTitle: "Cancel", //
                handleClick: handleClickCancel,
            },
            {
                buttonTitle: "Save", //
                handleClick: handleClickSave,
                variant: "contained" as const,
                disabled: !!disabled,
            },
        ],
    };
};
