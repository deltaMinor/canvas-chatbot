import { Tab, TabProps, Tabs, TabsProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { clsx } from "clsx";

const getSxList = (sx: SxProps<Theme> | undefined) => (Array.isArray(sx) ? sx : sx ? [sx] : []);

interface MuiTabsRootProps extends TabsProps {}
interface MuiTabsTabProps extends TabProps {}

const MuiTabsRoot = ({ children, className = "", sx, ...tabsProps }: MuiTabsRootProps) => {
    return (
        <Tabs
            className={clsx("components-mui-tabs__styled-tabs", className)}
            sx={[
                {
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    minHeight: 32,
                    p: 0.25,
                    "& .MuiTabs-scroller": {
                        minHeight: 26,
                    },
                    "& .MuiTabs-list": {
                        alignItems: "center",
                        minHeight: 26,
                    },
                    "& .MuiTabs-flexContainer": {
                        alignItems: "center",
                        gap: 0.5,
                        minHeight: 26,
                    },
                    "& .MuiTabs-indicator": {
                        display: "none",
                    },
                    "& .MuiTab-root": {
                        border: "1px solid transparent",
                        borderRadius: 0.75,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        height: 32,
                        letterSpacing: 0,
                        lineHeight: 1.2,
                        minHeight: 26,
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        textTransform: "none",
                        transition:
                            "background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
                    },
                    // Hover on unselected tabs — lift to paper, darken text
                    "& .MuiTab-root:hover:not(.Mui-selected)": {
                        backgroundColor: "background.paper",
                        color: "text.primary",
                    },
                    // Selected tab — card appearance
                    "& .MuiTab-root.Mui-selected": {
                        backgroundColor: "background.paper",
                        borderColor: "divider",
                        boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                                ? "0 1px 3px rgba(0, 0, 0, 0.4)"
                                : "0 1px 3px rgba(16, 24, 40, 0.10), 0 1px 2px rgba(16, 24, 40, 0.06)",
                        color: "text.primary",
                        fontWeight: 600,
                    },
                    // Selected tab hover — keep text stable, subtle brightness shift
                    "& .MuiTab-root.Mui-selected:hover": {
                        backgroundColor: "background.paper",
                        borderColor: "divider",
                        color: "text.primary",
                    },
                    // Focus ring — keyboard navigation only
                    "& .MuiTab-root.Mui-focusVisible": {
                        boxShadow: (theme) =>
                            `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`,
                        outline: "none",
                    },
                },
                ...getSxList(sx),
            ]}
            {...tabsProps}
        >
            {children}
        </Tabs>
    );
};

const MuiTabsTab = ({ ...tabProps }: MuiTabsTabProps) => {
    return <Tab {...tabProps} />;
};

const MuiTabs = {
    Root: MuiTabsRoot,
    Tab: MuiTabsTab,
};

export default MuiTabs;
