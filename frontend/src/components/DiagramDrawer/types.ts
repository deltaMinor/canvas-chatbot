export interface DiagramDrawerMenuOption {
    label: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
}
