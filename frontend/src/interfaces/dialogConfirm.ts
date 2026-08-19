import type { ReactNode } from "react";

import type { Breakpoint, ButtonProps } from "@mui/material";

export interface ConfirmDialogProps {
    stateKey: string;
    title: ReactNode;
    message: ReactNode;
    data?: string[] | ReactNode[];
    getDataFunc?: () => string[] | ReactNode[];
    onClick: () => Promise<void>;
    onClickNo?: () => Promise<void>;
    warningMessage?: string;
    buttonLabelMapping?: {
        yes?: string;
        no?: string;
    };
    buttonProps?: {
        yes?: Partial<ButtonProps>;
        no?: Partial<ButtonProps>;
    };
    secondaryConfirmNo?: {
        message: string;
        warningMessage?: string;
        buttonLabelMapping?: {
            yes?: string;
            no?: string;
        };
        buttonProps?: {
            yes?: Partial<ButtonProps>;
            no?: Partial<ButtonProps>;
        };
    };
    secondaryConfirmYes?: {
        message: string;
        warningMessage?: string;
        buttonLabelMapping?: {
            yes?: string;
            no?: string;
        };
        buttonProps?: {
            yes?: Partial<ButtonProps>;
            no?: Partial<ButtonProps>;
        };
    };
    additionalComponent?: ReactNode;
    topComponent?: ReactNode;
    maxWidth?: Breakpoint;
}
