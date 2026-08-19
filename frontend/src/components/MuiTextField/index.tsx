import React from "react";

import { Box, CircularProgress, TextFieldProps, TextFieldVariants } from "@mui/material";

import { StyledTextField } from "./styled";

const defaultTextFieldStyle = {};
const defaultTextFieldSx = {};
export type MuiTextFieldProps = TextFieldProps & {
    id: string;
    refValues?: React.RefObject<{ [key: string]: unknown }>;
    // defaultValue?: string | number;
    //
    displayAsTextArea?: boolean;
    endAdornmentIcon?: React.ReactNode;
    maxChar?: number;
    handleBlur?: (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => Promise<void>;
    handleChange?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => Promise<void>;
    handleInvalid?: (e: React.FormEvent<HTMLDivElement>) => Promise<void>;
    handleSubmit?: (v: number | string | string[]) => Promise<void>;
    showCircular?: boolean;
    //
    variant?: TextFieldVariants;
    validatorString?: RegExp;
    allowSpaceChar?: boolean;
    validateTextInput?: boolean;
};

const MuiTextFieldComponent = ({
    ...props //
}: MuiTextFieldProps) => {
    const {
        id,
        refValues,
        value: props__value,
        defaultValue: props__defaultValue,
        //
        displayAsTextArea,
        endAdornmentIcon,
        maxChar,
        handleBlur,
        handleChange,
        handleInvalid,
        handleSubmit,
        showCircular,
        //
        style: textFieldStyle,
        sx: textFieldSx,
        slotProps: resolvedTextFieldSlotProps,
        validatorString = /^[0-9a-zA-Z\\,./<>?;':"`~=+_\-{}|[\]!@#$%^&*()]*$/,
        validateTextInput = false,
        allowSpaceChar = true,
        type: textFieldType = "text",
        ...textFieldProps
    } = props;
    const {
        input: textFieldSlotPropsInput, //
        ...textFieldSlotProps
    } = resolvedTextFieldSlotProps || {};

    const defaultValueByType = textFieldType === "number" || textFieldType === "multiText" ? 0 : "";
    const getValueByType = (_value: number | string) => {
        if (textFieldType === "number") {
            return Number(_value);
        }
        return `${_value}`;
    };

    const isControlled = props__value !== undefined;
    const [value, setValue] = React.useState<unknown>(props__defaultValue || defaultValueByType);
    const [openCircular, setOpenCircular] = React.useState<boolean>(false);
    const inputValue = isControlled ? props__value : value;
    let defaultValidator = validatorString;
    if (!!allowSpaceChar) {
        defaultValidator = new RegExp(
            validatorString.source.replace("]*$", " ]*$"),
            validatorString.flags
        );
    }

    const onChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => {
        const _value = getValueByType(event?.target?.value);

        if (textFieldType === "text" && !!validateTextInput) {
            const stripped = (_value as string).replace(defaultValidator, "")?.trim();
            if (!!stripped) return;
            if (!!maxChar && (_value as string)?.length > maxChar) {
                return;
            }
        }
        if (!isControlled) {
            setValue(_value);
        }
        if (!!handleChange) {
            handleChange(event);
        }
        if (!!refValues) refValues.current[id] = _value;
    };

    const onBlur = async (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => {
        if (!!handleBlur) {
            handleBlur(event);
        }
    };

    const onInvalid = (event: React.FormEvent<HTMLDivElement>) => {
        if (!!handleInvalid) {
            handleInvalid(event);
        }
    };

    const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        if (!!showCircular) setOpenCircular(true);
        if (!!handleSubmit) {
            handleSubmit(inputValue as string | number);
        }
        if (!!showCircular) setOpenCircular(false);
    };

    const getChangeHandler = () => {
        const handler = {} as Record<string, unknown>;
        if (!!handleBlur) {
            handler["onBlur"] = onBlur;
        }
        if (!!handleSubmit) {
            handler["onKeyDown"] = onKeyDown;
        }
        return handler;
    };
    const changeHandler = getChangeHandler();

    React.useEffect(() => {
        if (isControlled || props__defaultValue === value) return;

        setValue(props__defaultValue || defaultValueByType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlled, props__defaultValue]);

    return (
        <StyledTextField //
            id={id}
            value={inputValue}
            className="MuiTextField"
            maxRows={7}
            minRows={displayAsTextArea ? 3 : 1}
            onBlur={onBlur}
            onChange={onChange}
            onInvalid={onInvalid}
            type={textFieldType}
            slotProps={{
                input: {
                    endAdornment: !!openCircular ? (
                        <Box
                            style={{
                                display: "flex", //
                            }}
                            className="h-full" //
                        >
                            <CircularProgress
                                size={20} //
                                style={{ margin: "auto" }}
                            />
                        </Box>
                    ) : (
                        <>{endAdornmentIcon}</>
                    ),
                    ...textFieldSlotPropsInput,
                },
                ...textFieldSlotProps,
            }}
            style={{
                ...defaultTextFieldStyle,
                ...textFieldStyle,
            }}
            sx={{
                ...defaultTextFieldSx, //
                ...textFieldSx,
            }}
            {...changeHandler}
            {...textFieldProps}
        />
    );
};

export default React.memo(MuiTextFieldComponent);
