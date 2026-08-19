export interface CustomMenuType {
    handleClickMenu: () => void;
    Icon: () => React.ReactElement;
    text: string;
    disabled?: boolean;
    isLastStep?: boolean;
}
