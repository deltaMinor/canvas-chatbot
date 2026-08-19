import { Badge, useTheme } from "@mui/material";

import { LogoSign, LogoSignInner, LogoSignWrapper, LogoWrapper, TooltipWrapper } from "./styled";

function Logo() {
    const theme = useTheme();

    return (
        <TooltipWrapper
            title="Tokyo Free White React Typescript Admin Dashboard"
            arrow
        >
            <LogoWrapper to="/">
                <Badge
                    sx={{
                        ".MuiBadge-badge": {
                            fontSize: theme.typography.pxToRem(11),
                            right: -2,
                            top: 8,
                        },
                    }}
                    overlap="circular"
                    color="success"
                    badgeContent="2.0"
                >
                    <LogoSignWrapper>
                        <LogoSign>
                            <LogoSignInner />
                        </LogoSign>
                    </LogoSignWrapper>
                </Badge>
            </LogoWrapper>
        </TooltipWrapper>
    );
}

export default Logo;
