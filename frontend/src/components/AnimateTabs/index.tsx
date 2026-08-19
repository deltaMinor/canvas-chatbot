import React from "react";

import {
    Tabs as AnimateTabs,
    TabsHighlight,
    TabsHighlightItem,
    TabsList,
    TabsTrigger,
} from "#root/components/animate-ui/primitives/animate/tabs";

// Custom types to replace MUI types
interface TabLikeProps {
    value?: string | number;
    label?: React.ReactNode;
    icon?: React.ReactNode;
    iconPosition?: "start" | "end" | "top" | "bottom";
    disabled?: boolean;
    [key: string]: unknown;
}

interface AnimateTabsProps {
    value?: string | number;
    onChange?: (event: React.SyntheticEvent, value: string | number) => void;
    defaultValue?: string | number;
    className?: string;
    children: React.ReactElement<TabLikeProps> | React.ReactElement<TabLikeProps>[];
}

const AnimateTabsComponent = ({ children, value, onChange, className = "" }: AnimateTabsProps) => {
    // Convert Tab children to animate-ui structure
    const tabsArray = React.Children.toArray(children) as React.ReactElement<TabLikeProps>[];

    // Convert value to string if it's a number (MUI uses numbers, animate-ui uses strings)
    // AnimateTabs requires a string value, so we use the first tab's value as default if undefined
    const defaultValue = tabsArray[0]
        ? tabsArray[0].props.value !== undefined
            ? String(tabsArray[0].props.value)
            : "0"
        : "0";
    const stringValue = value !== undefined ? String(value) : defaultValue;

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (onChange) {
                // Convert string back to number if original value was a number
                const numValue = Number(newValue);
                const isNumeric = !isNaN(numValue) && tabsArray.some((_, idx) => idx === numValue);
                const finalValue = isNumeric ? numValue : newValue;
                const syntheticEvent = {
                    currentTarget: {},
                    target: {},
                } as React.SyntheticEvent;
                onChange(syntheticEvent, finalValue);
            }
        },
        [onChange, tabsArray]
    );

    return (
        <AnimateTabs
            value={stringValue}
            onValueChange={handleValueChange}
            className={className}
        >
            <TabsHighlight className="bg-background absolute inset-0 z-0">
                <TabsList className="bg-accent inline-flex h-5 w-full gap-0.5 p-0.5">
                    {tabsArray.map((tab, index) => {
                        const tabValue =
                            tab.props.value !== undefined ? String(tab.props.value) : String(index);
                        const isDisabled = tab.props.disabled || false;
                        const label = tab.props.label;
                        const icon = tab.props.icon;
                        const iconPosition = tab.props.iconPosition || "start";

                        return (
                            <TabsHighlightItem
                                key={tabValue}
                                value={tabValue}
                                className="flex-1"
                            >
                                <TabsTrigger
                                    value={tabValue}
                                    disabled={isDisabled}
                                    className="flex h-full w-full items-center justify-center gap-1.5 px-3 py-0.5 text-sm leading-tight"
                                >
                                    {icon && iconPosition === "start" && icon}
                                    {label}
                                    {icon && iconPosition === "end" && icon}
                                </TabsTrigger>
                            </TabsHighlightItem>
                        );
                    })}
                </TabsList>
            </TabsHighlight>
        </AnimateTabs>
    );
};

export default React.memo(AnimateTabsComponent);
