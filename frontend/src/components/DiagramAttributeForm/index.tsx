import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Box, alpha } from "@mui/material";

import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { handleCloseDialogAsync, handleOpenDialog } from "#root/stores/dialogStore";

import AttributeDrawerAccordion from "./AttributeDrawerAccordion";
import AttributeDrawerDeleteButton from "./AttributeDrawerDeleteButton";
import AttributeDrawerFields from "./AttributeDrawerFields";
import AttributeDrawerFooter from "./AttributeDrawerFooter";
import AttributeDrawerTabContent from "./AttributeDrawerTabContent";
import AttributeDrawerTabs from "./AttributeDrawerTabs";
import { AttributeDrawerContext, useAttributeDrawerContext } from "./useAttributeDrawerContext";
import { AttributeDrawerFormBridgeContext } from "./useAttributeDrawerFormBridge";

export interface AttributeDrawerRootProps {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
    onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
    onCancel?: () => Promise<void> | void;
    closeConfirmStateKey?: DialogConfirmStateEnum;
    onDirtyStateChange?: (isDirty: boolean) => void;
}

export interface AttributeDrawerTabContentWrapperProps {
    children: React.ReactNode;
}

export interface AttributeDrawerTabPanelProps {
    index: number;
    children: React.ReactNode;
}

const AttributeDrawerTabContentWrapperComponent = ({
    children,
}: AttributeDrawerTabContentWrapperProps) => {
    return (
        <Box
            className="diagram-attribute-form__tab-content-wrapper"
            sx={{
                background: (theme) =>
                    `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.9)} 0%, ${alpha(theme.palette.grey[50], 0.96)} 100%)`,
                borderRadius: 0,
                border: "none",
                boxShadow: "none",
            }}
        >
            {children}
        </Box>
    );
};

const AttributeDrawerTabPanelComponent = ({ index, children }: AttributeDrawerTabPanelProps) => {
    const { tabValue } = useAttributeDrawerContext();

    if (tabValue !== index) return null;

    return <>{children}</>;
};

const AttributeDrawerRootComponent = ({
    children,
    defaultValues,
    onSubmit,
    onCancel,
    closeConfirmStateKey,
    onDirtyStateChange,
}: AttributeDrawerRootProps): React.ReactElement => {
    const [tabValue, setTabValue] = React.useState(0);
    const formMethods = useForm<Record<string, unknown>>({
        defaultValues: defaultValues ?? {},
    });
    const {
        handleSubmit,
        reset,
        formState: { isDirty },
    } = formMethods;

    const handleTabChange = React.useCallback(
        (_event: React.SyntheticEvent, newValue: string | number) => {
            setTabValue(typeof newValue === "number" ? newValue : Number(newValue));
        },
        []
    );

    const drawerContextValue = React.useMemo(
        () => ({
            tabValue,
            handleTabChange,
            handleCancelForm: async () => {
                if (isDirty && closeConfirmStateKey) {
                    handleOpenDialog(closeConfirmStateKey);
                    return;
                }

                await onCancel?.();
            },
        }),
        [closeConfirmStateKey, handleTabChange, isDirty, onCancel, tabValue]
    );

    React.useEffect(() => {
        reset(defaultValues ?? {});
    }, [defaultValues, reset]);

    const submitForm = React.useCallback(async () => {
        await handleSubmit(async (values) => {
            await onSubmit?.(values);
        })();
    }, [handleSubmit, onSubmit]);

    const closeWithoutSaving = React.useCallback(async () => {
        if (closeConfirmStateKey) {
            await handleCloseDialogAsync(closeConfirmStateKey);
        }
        await onCancel?.();
    }, [closeConfirmStateKey, onCancel]);

    const requestClose = React.useCallback(async () => {
        if (isDirty && closeConfirmStateKey) {
            handleOpenDialog(closeConfirmStateKey);
            return;
        }

        await onCancel?.();
    }, [closeConfirmStateKey, isDirty, onCancel]);

    const formBridgeValue = React.useMemo(
        () => ({
            formBridge: {
                hasChanges: () => isDirty,
                requestClose,
                submitForm,
                closeWithoutSaving,
            },
        }),
        [closeWithoutSaving, isDirty, requestClose, submitForm]
    );

    React.useEffect(() => {
        onDirtyStateChange?.(isDirty);

        return () => {
            onDirtyStateChange?.(false);
        };
    }, [isDirty, onDirtyStateChange]);

    return (
        <AttributeDrawerContext.Provider value={drawerContextValue}>
            <AttributeDrawerFormBridgeContext.Provider value={formBridgeValue}>
                <FormProvider {...formMethods}>
                    <Box
                        className="diagram-attribute-form__root-form"
                        component="form"
                        onSubmit={handleSubmit(async (values) => {
                            await onSubmit?.(values);
                        })}
                        sx={{
                            position: "relative",
                            overflow: "visible",
                        }}
                    >
                        {children}
                    </Box>
                </FormProvider>
            </AttributeDrawerFormBridgeContext.Provider>
        </AttributeDrawerContext.Provider>
    );
};

const AttributeDrawerRoot = React.memo(
    AttributeDrawerRootComponent
) as typeof AttributeDrawerRootComponent;
const AttributeDrawerTabContentWrapper = React.memo(
    AttributeDrawerTabContentWrapperComponent
) as typeof AttributeDrawerTabContentWrapperComponent;
const AttributeDrawerTabPanel = React.memo(
    AttributeDrawerTabPanelComponent
) as typeof AttributeDrawerTabPanelComponent;

const AttributeDrawer = Object.assign(AttributeDrawerRoot, {
    Root: AttributeDrawerRoot,
    Accordion: AttributeDrawerAccordion,
    Tabs: AttributeDrawerTabs,
    TabContentWrapper: AttributeDrawerTabContentWrapper,
    TabPanel: AttributeDrawerTabPanel,
    TabContent: AttributeDrawerTabContent,
    DeleteButton: AttributeDrawerDeleteButton,
    Footer: AttributeDrawerFooter,
    Fields: AttributeDrawerFields,
});

export type { AttributeDrawerAccordionProps } from "./AttributeDrawerAccordion";
export type { AttributeDrawerDeleteButtonProps } from "./AttributeDrawerDeleteButton";
export type { DrawerFieldsProps as AttributeDrawerFieldsProps } from "./AttributeDrawerFields";
export type { AttributeDrawerFooterProps } from "./AttributeDrawerFooter";
export type { AttributeDrawerTabContentProps } from "./AttributeDrawerTabContent";
export type { AttributeDrawerTabsProps } from "./AttributeDrawerTabs";

export default AttributeDrawer;
