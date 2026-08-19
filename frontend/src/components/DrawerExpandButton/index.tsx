import React from "react";

import MuiTooltip from "#root/components/MuiTooltip";

import { ExpandButton, ExpandButtonContainer, ExpandIcon } from "./styled";

export interface DrawerExpandButtonProps {
    tooltipTitle: string;
    ariaLabel: string;
    onClick: () => void;
    disabled?: boolean;
}

const DrawerExpandButtonComponent: React.FC<DrawerExpandButtonProps> = ({
    tooltipTitle,
    ariaLabel,
    onClick,
    disabled = false,
}) => {
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault();
                onClick();
            }
        },
        [disabled, onClick]
    );

    return (
        <ExpandButtonContainer>
            <MuiTooltip
                title={tooltipTitle}
                placement="right"
                arrow
            >
                <ExpandButton
                    onClick={onClick}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={ariaLabel}
                    aria-disabled={disabled}
                    onKeyDown={handleKeyDown}
                    sx={{
                        ...(disabled && {
                            cursor: "not-allowed",
                            opacity: 0.4,
                        }),
                    }}
                >
                    <ExpandIcon className="expand-icon" />
                </ExpandButton>
            </MuiTooltip>
        </ExpandButtonContainer>
    );
};

export default React.memo(DrawerExpandButtonComponent);
