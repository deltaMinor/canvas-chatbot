import React from "react";

import { TextFieldProps } from "@mui/material";

import MuiTextField from "#root/components/MuiTextField";
import { MAX_CHAR_USERNAME } from "#root/constants/user";
import { UserFieldKey } from "#root/interfaces/user";

type MuiTextFieldUsernameProps = TextFieldProps & {
    handleChangeUsername: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> //
    ) => Promise<void>;
    handleSubmit: () => Promise<void>;
    maxChar?: number;
    tabIndex?: number;
};

const MuiTextFieldUsernameComponent = ({
    handleChangeUsername, //
    handleSubmit,
    tabIndex,
    maxChar = MAX_CHAR_USERNAME,
    variant = "outlined",
    ...props
}: MuiTextFieldUsernameProps) => {
    return (
        <MuiTextField //
            name={UserFieldKey.username}
            autoComplete="username"
            label="Username"
            //
            handleChange={handleChangeUsername}
            handleSubmit={handleSubmit}
            //
            allowSpaceChar={false}
            autoFocus
            fullWidth
            maxChar={maxChar}
            // size="small"
            tabIndex={tabIndex}
            validateTextInput
            {...props}
            id={UserFieldKey.username ?? ""}
            variant={variant}
        />
    );
};

export default React.memo(MuiTextFieldUsernameComponent);
