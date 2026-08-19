export enum DetailsSectionType {
    DASHBOARD = "dashboard",
    MITIGATION = "mitigation",
    REGISTER = "register",
    VISUALIZER = "threat_scenario",
    CONCEPTION = "conception_questionnaire",
    DIAGRAM = "architecture",
    SETTINGS = "settings",
}

export interface SidebarMenuItemProps {
    text?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    hidden?: boolean;
    isActive?: boolean;
    href?: string;
}
