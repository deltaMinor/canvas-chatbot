import DialogSelectGroupField from "./DialogSelectGroupField";

const DialogSelectGroupMultiField = (props: Parameters<typeof DialogSelectGroupField>[0]) => {
    return (
        <DialogSelectGroupField
            {...props}
            isMulti
        />
    );
};

export default DialogSelectGroupMultiField;
