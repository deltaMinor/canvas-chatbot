import React from "react";

import { Box, Card, CardContent, Tab, Tabs } from "@mui/material";

import MuiTooltip from "#root/components/MuiTooltip";

import TabPanel from "./TabPanel";
import { TabsVariantType } from "./interface";

const initValue = 0;

interface AppTabsProps {
    tabLabelProperties: {
        label: string;
        disableTab?: boolean;
    }[];
    TabContents: React.FC<unknown>[];
    helperText?: boolean;
    centered?: boolean;
    variant?: string;
    backgroundColor?: string;
    tabValue?: number;
    id?: string;
}

const AppTabsComponent = ({
    tabLabelProperties,
    TabContents,
    variant = "scrollable",
    helperText = true,
    centered = false,
    backgroundColor = "#f2f5f9",
    tabValue: props__tabValue,
    id,
}: AppTabsProps) => {
    const hasMultipleTabs = tabLabelProperties.length > 1;
    const valueRef = React.useRef(initValue);
    const [value, setValue] = React.useState(initValue);
    const [tabValue, setTabValue] = React.useState(initValue);

    const handleChange = React.useCallback((_event: React.SyntheticEvent, newValue: number) => {
        valueRef.current = newValue;
        setValue(newValue);
    }, []);

    const handleAnimationEnd = React.useCallback(() => {
        setTabValue(valueRef.current);
    }, []);

    const a11yProps = React.useCallback((index: number) => {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }, []);

    React.useEffect(() => {
        if (props__tabValue === undefined) return;
        setValue(props__tabValue);
    }, [props__tabValue]);

    return (
        <Card //
            id={id}
            className="w-full shadow-none"
        >
            <CardContent //
                className="px-0 pt-1 pb-0"
            >
                <Box>
                    {hasMultipleTabs && (
                        <Tabs
                            variant={(variant as TabsVariantType) ?? "standard"}
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
                            centered={centered}
                            value={value}
                            onChange={handleChange}
                            onAnimationEnd={handleAnimationEnd}
                            className="px-1"
                        >
                            {tabLabelProperties.map((props, label_index) => {
                                const label = props?.label || "";
                                const disableTab = props?.disableTab || false;
                                return helperText ? (
                                    <MuiTooltip
                                        key={label}
                                        title={`${label} helper text`}
                                        placement="top"
                                        arrow
                                    >
                                        <Tab
                                            label={label}
                                            disabled={disableTab}
                                            {...a11yProps(label_index)}
                                        />
                                    </MuiTooltip>
                                ) : (
                                    <Tab
                                        key={label}
                                        label={label}
                                        disabled={disableTab}
                                        {...a11yProps(label_index)}
                                    />
                                );
                            })}
                        </Tabs>
                    )}
                    {TabContents.map((TabContent, tab_index) => {
                        return (
                            tabValue === tab_index && (
                                <TabPanel
                                    key={tab_index} //
                                    backgroundColor={backgroundColor}
                                >
                                    <TabContent />
                                </TabPanel>
                            )
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
};

export default React.memo(AppTabsComponent);
