import { Box } from "@mui/material";

import { DialogFieldTypeEnum } from "#root/enums/dialog";
import { DialogFieldComponentProps } from "#root/interfaces/dialogField";

import DialogCheckboxGroup from "../components/DialogCheckboxGroup";
import DialogDatePickerField from "../components/DialogDatePickerField";
import DialogDisplayTextField from "../components/DialogDisplayTextField";
import DialogPasswordField from "../components/DialogPasswordField";
import DialogReactSelect from "../components/DialogReactSelect";
import DialogSelectGroupField from "../components/DialogSelectGroupField";
import DialogSelectGroupMultiField from "../components/DialogSelectGroupMultiField";
import DialogTextField from "../components/DialogTextField";
import DialogToggleField from "../components/DialogToggleField";
import DialogUploadField from "../components/DialogUploadField";
import DialogUrlField from "../components/DialogUrlField";

import { StyledDialogFieldBox } from "./styled";

export const getComponent = ({
    field, //
    refValues,
    disabled,
}: DialogFieldComponentProps) => {
    switch (field.type) {
        case DialogFieldTypeEnum.reactSelect:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogReactSelect
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.selectGroup:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogSelectGroupField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.reactSelectMulti:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogReactSelect
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                        isMulti
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.selectGroupMulti:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogSelectGroupMultiField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.password:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogPasswordField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.text:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogTextField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.textarea:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogTextField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                        displayAsTextArea={true}
                        multiline={true}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.upload:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogUploadField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.checkboxGroup:
            return (
                <Box
                    id={field.id} //
                    key={field.id}
                    className="DialogFormField_Box"
                >
                    <DialogCheckboxGroup
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </Box>
            );
        // display
        case DialogFieldTypeEnum.displayText:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogDisplayTextField
                        field={field} //
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.url:
            return (
                <StyledDialogFieldBox //
                    id={field.id}
                    key={field.id}
                >
                    <DialogUrlField
                        field={field} //
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </StyledDialogFieldBox>
            );
        case DialogFieldTypeEnum.datePicker:
            return (
                <DialogDatePickerField
                    key={field.id}
                    field={field}
                    refValues={refValues}
                    disabled={!!disabled}
                />
            );
        case DialogFieldTypeEnum.toggle:
            return (
                <Box
                    id={field.id}
                    key={field.id}
                    className="DialogFormField_Box"
                >
                    <DialogToggleField
                        field={field}
                        refValues={refValues}
                        disabled={!!disabled}
                    />
                </Box>
            );
        default:
            return <div key={field.id}></div>;
    }
};
