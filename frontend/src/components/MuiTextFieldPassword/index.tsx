import React from "react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment, TextFieldProps } from "@mui/material";
import { ZxcvbnFactory, ZxcvbnResult } from "@zxcvbn-ts/core";

import ColouredBars from "#root/components/ColouredBars";
import MuiTextField from "#root/components/MuiTextField";
import { MAX_CHAR_PASSWORD } from "#root/constants/user";
import { UserFieldKey } from "#root/enums/app";

type MuiTextFieldPasswordProps = TextFieldProps & {
    id?: string;
    label?: string;
    name?: string;
    handleChangePassword: (
        ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => Promise<void>;
    //
    allowSpaceChar?: boolean;
    disableColoredBar?: boolean;
    maxChar?: number;
    handleSubmit?: () => Promise<void>;
    validatorString?: RegExp;
    tabIndex?: number;
    disabled?: boolean;
};

const MuiTextFieldPasswordComponent = ({
    maxChar = MAX_CHAR_PASSWORD,
    handleChangePassword,
    disableColoredBar = false,
    handleSubmit = async () => {},
    tabIndex,
    variant: _variant,
    ...props
}: MuiTextFieldPasswordProps) => {
    // Hooks
    const [strength, setStrength] = React.useState<ZxcvbnResult>({} as ZxcvbnResult);
    const [password, setPassword] = React.useState<string>("");
    const [showPassword, setShowPassword] = React.useState(false);
    const zxcvbnRef = React.useRef<ZxcvbnFactory | null>(null);

    // Hooked variables
    const defaultValidator = React.useMemo(
        () => /^[0-9a-zA-Z\\,./<>?;':"`~=+_\-{}|[\]!@#$%^&*()]*$/,
        []
    );

    const handleClickShowPassword = React.useCallback(async () => {
        setShowPassword((show) => !show);
    }, []);

    const handleMouseDownPassword = React.useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
        },
        []
    );

    const handleChangeTextField = React.useCallback(
        async (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = ev.target.value;
            const stripped = value.replace(defaultValidator, "");
            if (!!stripped) return;
            if (!!maxChar && value?.length > maxChar) return;
            setPassword(value);
            handleChangePassword(ev);
        },
        [handleChangePassword, setPassword, maxChar, defaultValidator]
    );

    React.useEffect(() => {
        const loadOptions = async () => {
            const zxcvbnCommonPackage = await import(
                "@zxcvbn-ts/language-common" //
            );
            const zxcvbnEnPackage = await import(
                "@zxcvbn-ts/language-en" //
            );

            return {
                dictionary: {
                    ...zxcvbnCommonPackage.dictionary,
                    ...zxcvbnEnPackage.dictionary,
                },
                graphs: zxcvbnCommonPackage.adjacencyGraphs,
                translations: zxcvbnEnPackage.translations,
            };
        };
        const reloadOptions = async () => {
            const options = await loadOptions();
            if (!options) return;
            zxcvbnRef.current = new ZxcvbnFactory(options);
        };
        reloadOptions();
    }, []);

    React.useEffect(() => {
        const checkPasswordStrength = async () => {
            if (!password || !zxcvbnRef.current) return;
            const results = zxcvbnRef.current.check(password);
            setStrength(results);
        };
        checkPasswordStrength();
    }, [password]);

    return (
        <>
            <MuiTextField //
                variant="outlined"
                id={props.id ?? UserFieldKey.password}
                label={props.label ?? "Password"}
                name={props.name ?? UserFieldKey.password}
                autoComplete="current-password"
                //
                className="MuiTextField"
                fullWidth
                tabIndex={tabIndex}
                value={password}
                type={showPassword ? "text" : "password"}
                // size="small"
                endAdornmentIcon={
                    <InputAdornment //
                        position="end"
                        className="p-0"
                    >
                        <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            size="large"
                            className="rounded p-0.5"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                handleChange={handleChangeTextField}
                handleSubmit={async () => {
                    await handleSubmit();
                }}
                inputProps={{ maxLength: maxChar }}
                maxChar={maxChar}
                validateTextInput
                validatorString={props.validatorString ?? defaultValidator}
                {...props}
            />
            {!disableColoredBar && <ColouredBars score={strength?.score || 0} />}
        </>
    );
};

export default React.memo(MuiTextFieldPasswordComponent);
