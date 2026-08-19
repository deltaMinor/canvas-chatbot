import React from "react";

import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Box, Tab, Tabs } from "@mui/material";

import { useAttributeDrawerContext } from "./useAttributeDrawerContext";

export interface AttributeDrawerTabsProps {
    tabLabels: string[];
}

const AttributeDrawerTabsComponent = ({ tabLabels }: AttributeDrawerTabsProps) => {
    const { tabValue, handleTabChange } = useAttributeDrawerContext();
    const tabIconMapping = React.useMemo(
        () => ({
            data: <DataObjectRoundedIcon fontSize="small" />,
            properties: <SettingsRoundedIcon fontSize="small" />,
            style: <PaletteOutlinedIcon fontSize="small" />,
        }),
        []
    );
    const getTabIcon = React.useCallback(
        (tabLabel: string) =>
            tabIconMapping[tabLabel.toLowerCase() as keyof typeof tabIconMapping] ?? (
                <DataObjectRoundedIcon fontSize="small" />
            ),
        [tabIconMapping]
    );

    return (
        <Box className="attribute-drawer-tabs-root">
            <Box className="attribute-drawer-tabs-frame">
                <Tabs
                    className="attribute-drawer-tabs-nav"
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    aria-label="Attribute drawer tabs"
                    TabIndicatorProps={{
                        children: <span className="attribute-drawer-tabs-indicator" />,
                    }}
                >
                    {tabLabels.map((tabLabel, index) => (
                        <Tab
                            key={index}
                            disableRipple
                            className="attribute-drawer-tab"
                            sx={{
                                minHeight: 44,
                                py: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "& .attribute-drawer-tab__content": {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: 24,
                                    lineHeight: 1,
                                },
                                "& .attribute-drawer-tab__icon": {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    alignSelf: "center",
                                },
                                "& .attribute-drawer-tab__label": {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    lineHeight: 1,
                                },
                            }}
                            label={
                                <span className="attribute-drawer-tab__content">
                                    <span className="attribute-drawer-tab__icon">
                                        {getTabIcon(tabLabel)}
                                    </span>
                                    <span className="attribute-drawer-tab__label">{tabLabel}</span>
                                </span>
                            }
                        />
                    ))}
                </Tabs>
            </Box>
        </Box>
    );
};

const AttributeDrawerTabs = React.memo(
    AttributeDrawerTabsComponent
) as typeof AttributeDrawerTabsComponent;

export default AttributeDrawerTabs;
