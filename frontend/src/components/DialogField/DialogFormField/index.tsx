import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import { getComponent } from "./getFieldComponent";

interface DialogFormFieldProps extends DialogFieldComponentProps {
    hiddenStates: Record<string, boolean>; //
}

const DialogFormFieldComponent = ({
    field, //
    refValues,
    hiddenStates,
    disabled,
}: DialogFormFieldProps) => {
    if (!!hiddenStates?.[field.id]) return <></>;

    return (
        <>
            {getComponent({
                field, //
                refValues,
                disabled: !!disabled,
            })}
        </>
    );
};

export default DialogFormFieldComponent;
